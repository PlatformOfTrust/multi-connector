'use strict';
const path = require('path');
const fs = require('fs');
const util = require('util');
const winston = require('../../logger.js');
const strftime = require('mout/date/strftime');
const pick = require('mout/object/pick');

let SFTP_OPEN_MODE, SFTP_STATUS_CODE;
let flagsToString, basePath;

// Adds basePath
function pathRemoteToLocal (remotepath) {
    const parts = remotepath.split('/');
    const count = parts.filter(p => p === '..').length;
    const path = count > 0 ? parts.slice(0, -count).join('/') : parts.join('/');
    return `${basePath}${path === '.' ? '/' : (path[path.length - 1] === '.' ? '/' : path)}`;
}

const logger = {
    // debug: (...args) => winston.log('debug', util.format(...args)),
    //info: (...args) => winston.log('info', util.format(...args)),
    debug: () => {},
    info: () => {},
    error: (...args) => winston.log('error', util.format(...args)),
};

const errorCode = (code) => {
    if (['ENOTEMPTY', 'ENOTDIR', 'ENOENT'].includes(code))
        return SFTP_STATUS_CODE.NO_SUCH_FILE;
    if (['EACCES', 'EEXIST', 'EISDIR'].includes(code))
        return SFTP_STATUS_CODE.PERMISSION_DENIED;
    return SFTP_STATUS_CODE.FAILURE;
};

const modeLinux = (filename, filepath) => {
    const correspondences = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

    if (filename === '' && filepath !== '/') { //this is root
        filename = filepath.toLowerCase().replace(':', '');
    }

    const user = 'user', group = 'user', uid = 1000;

    try {
        const stats = fs.statSync(filepath);
        const unixFilePermissions = (stats.mode & parseInt('777', 8)).toString(8);

        const type = stats.isDirectory() ? 'd' : '-';
        let mode = '';
        for (let i = 0; i < unixFilePermissions.length; i++)
            mode = mode + correspondences[unixFilePermissions.charAt(i)];
        const date = strftime(new Date(stats.mtime), '%b %d %H:%M');//Jun 16 14:41
        const longname = [type + mode, stats.nlink, user, group, stats.size, date, filename].join(' ');
        const attrs = pick(stats, ['mode', 'uid', 'gid', 'size', 'atime', 'mtime']);
        attrs.uid = attrs.gid = uid;

        return {filename, longname, attrs};
    } catch (err) {
        logger.error(err.message);
        return {
            filename,
            longname :  `?????????? ? ? ? ? ? ? ? ${filename}`,
        };
    }
};

class SFTP {
    constructor (sftpStream, options) {
        ({
            basePath,
            sftp: {
                flagsToString,
                OPEN_MODE: SFTP_OPEN_MODE,
                STATUS_CODE: SFTP_STATUS_CODE,
            },
        } = options);

        this.openFiles = {};
        this._handleCount = 0;
        this.sftpStream = sftpStream;

        sftpStream.on('OPEN', this._open.bind(this));
        sftpStream.on('CLOSE', this._close.bind(this));
        sftpStream.on('REALPATH', this._realpath.bind(this));
        sftpStream.on('STAT', this._onSTAT.bind(this, 'statSync'));
        sftpStream.on('OPENDIR', this._opendir.bind(this));
        sftpStream.on('READ', this._read.bind(this));
        sftpStream.on('REMOVE', this._remove.bind(this));
        sftpStream.on('RMDIR', this._rmdir.bind(this));
        sftpStream.on('MKDIR', this._mkdir.bind(this));
        sftpStream.on('RENAME', this._rename.bind(this));
        sftpStream.on('READDIR', this._readdir.bind(this));
        sftpStream.on('WRITE', this._write.bind(this));
        sftpStream.on('SETSTAT', this._setSTAT.bind(this));
        sftpStream.on('LSTAT', this._onSTAT.bind(this, 'lstatSync'));
        sftpStream.on('FSTAT', (reqID, handle) => {
            this._onSTAT('fstatSync', reqID, this.openFiles[handle].remotePath, handle);
        });
    }

    _setSTAT (reqid, remotepath, offset) {
        const filepath = pathRemoteToLocal(remotepath);
        logger.debug('SETSTAT', {filepath, remotepath, offset});
        try {
            fs.utimesSync(filepath, offset.atime, offset.mtime);
        } catch (err) {
            logger.error(err);
            return this.sftpStream.status(reqid, errorCode(err.code));
        }
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }

    _write (reqid, handle, offset, data) {
        //var state = this.openFiles[handle];
        fs.writeSync(handle[0], data, 0, data.length, offset);
        logger.debug('write to file at offset %d, length %d', offset, data.length);
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }

    _close (reqid, fd) {
        fs.closeSync(fd[0]);
        logger.info('CLOSE', {reqid, fd});
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }

    _realpath (reqid, filename) {
        logger.info('realpath ', filename, pathRemoteToLocal(filename));
        logger.info('REALPATH normalize ', filename);
        this.sftpStream.name(reqid, [{filename}]);
    }

    _onSTAT (statType, reqid, remotepath, handle) {
        const filepath = pathRemoteToLocal(remotepath);
        logger.info('STAT', {filepath, remotepath, statType, handle});
        try {
            const fstats = fs[statType](handle ? handle[0] : filepath);
            const stats = pick(fstats, ['mode', 'uid', 'gid', 'size', 'atime', 'mtime']);

            if (handle && this.openFiles[handle])
                this.openFiles[handle].stats = stats;
            return this.sftpStream.attrs(reqid, stats);
        } catch (err) {
            logger.error(err);
            return this.sftpStream.status(reqid, errorCode(err.code));
        }
    }

    _opendir (reqid, remotepath) {
        const filepath = pathRemoteToLocal(remotepath);
        logger.info('OPENDIR', {reqid, filepath, remotepath});

        try {
            const stat = fs.statSync(filepath);
            if (!stat.isDirectory()) {
                this.sftpStream.status(reqid, SFTP_STATUS_CODE.FAILURE);
                return;
            }
        } catch (err) {
            this.sftpStream.status(reqid, SFTP_STATUS_CODE.NO_SUCH_FILE);
            return;
        }

        return this._open(reqid, remotepath, SFTP_OPEN_MODE.READ);
    }

    _read (reqid, handle, offset, length) {
        logger.debug('READ', {reqid, offset, length});
        const state = this.openFiles[handle];

        if (offset >= state.stat.size)
            return this.sftpStream.status(reqid, SFTP_STATUS_CODE.EOF);

        const size = state.stat.size - state.pos > length ? length : state.stat.size - state.pos;
        const buffer = Buffer.alloc(size);

        fs.readSync(handle[0], buffer, 0, size, offset);
        state.pos += size;

        this.sftpStream.data(reqid, buffer);
    }

    _rename (reqid, remotepath, newremotePath) {
        const filepath = pathRemoteToLocal(remotepath);
        const newfilepath = pathRemoteToLocal(newremotePath);
        logger.info('RENAME', {filepath, remotepath, newfilepath, newremotePath});
        fs.renameSync(filepath, newfilepath);
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }

    _remove (reqid, remotepath) {
        const filepath = pathRemoteToLocal(remotepath);
        logger.info('REMOVE', {filepath, remotepath});
        fs.unlinkSync(filepath);
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }

    _rmdir (reqid, remotepath) {
        const filepath = pathRemoteToLocal(remotepath);
        logger.info('RMDIR', {filepath, remotepath});
        fs.rmdirSync(filepath);
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }

    _mkdir (reqid, remotepath /*, attrs*/) {
        const filepath = pathRemoteToLocal(remotepath);
        fs.mkdirSync(filepath, {recursive: true});
        this.sftpStream.status(reqid, SFTP_STATUS_CODE.OK);
    }


    async _readdir (reqid, handle) {
        logger.info('READDIR', this.openFiles[handle].filepath);
        if (this.openFiles[handle].closed) {
            this.sftpStream.status(reqid, SFTP_STATUS_CODE.EOF);
            return;
        }

        let names = fs.readdirSync(this.openFiles[handle].filepath);
        names.push('.', '..');
        names = names.map((v) => modeLinux(v, path.join(this.openFiles[handle].filepath, v)));
        this.openFiles[handle].closed = true;
        this.sftpStream.name(reqid, names);
    }

    _open (reqid, remotePath, flags, attrs) {
        const filepath = pathRemoteToLocal(remotePath);
        flags = flagsToString(flags);

        logger.info('OPEN', {reqid, filepath, flags, attrs});

        if (flags !== 'w' && flags !== 'wx' && !fs.existsSync(filepath)) {
            return this.sftpStream.status(reqid, SFTP_STATUS_CODE.NO_SUCH_FILE);
        }

        try {
            let handle = fs.openSync(filepath, flags);
            const stat = fs.statSync(filepath);
            handle = Buffer.from([handle]);
            this.openFiles[handle] = {remotePath, filepath, flags, stat, pos: 0};
            return this.sftpStream.handle(reqid, handle);
        } catch (err) {
            logger.error(err);
            return this.sftpStream.status(reqid, errorCode(err.code));
        }
    }
}

module.exports = SFTP;
