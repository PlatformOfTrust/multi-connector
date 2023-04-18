'use strict';
/**
 * Module dependencies.
 */
const {timingSafeEqual} = require('crypto');
const {readFileSync, readdirSync, unlinkSync, promises} = require('fs');
const winston = require('../../logger.js');

/**
 * SFTP Server.
 */

const {
    Server,
    utils: {
        sftp: {
            STATUS_CODE,
        },
    },
} = require('ssh2');
const DOWNLOAD_DIR = './temp/';

/**
 * Creates directory structure recursively for a given file path.
 *
 * @param {String} filepath
 */
const checkDir = async (filepath) => {
    try {
        if (process.platform === 'win32') {
            filepath = filepath.replace(/\\/g, '/');
        }
        let dst = filepath.split('/');
        // Remove filename part.
        dst.pop();
        dst = dst.join('/');
        await promises.access(dst).then(() => true).catch(async () => await promises.mkdir(dst, {recursive: true}));
    } catch (e) {
        console.log(e.message);
    }
};

function checkValue (input, allowed) {
    const autoReject = (input.length !== allowed.length);
    if (autoReject) {
        // Prevent leaking length information by always making a comparison with the
        // same input when lengths don't match what we expect ...
        allowed = input;
    }
    const isMatch = timingSafeEqual(input, allowed);
    return (!autoReject && isMatch);
}

/**
 * Starts SFTP server.
 *
 * @param {Object} config
 * @param {Object} options
 * @param {Function} _callback
 * @return {Object}
 */
const connect = async (config, options, _callback) => {
    let server;
    try {
        const allowedUser = Buffer.from(options.username);
        const allowedPassword = Buffer.from(options.password);

        server = new Server({
            hostKeys: [Buffer.from(options.privateKey, 'base64')],
        }, (client) => {
            client.on('authentication', (ctx) => {
                try {
                    let allowed = true;
                    if (!checkValue(Buffer.from(ctx.username), allowedUser))
                        allowed = false;

                    switch (ctx.method) {
                        case 'password':
                            if (!checkValue(Buffer.from(ctx.password), allowedPassword))
                                return ctx.reject();
                            break;
                        default:
                            return ctx.reject();
                    }

                    if (allowed)
                        ctx.accept();
                    else
                        ctx.reject();
                } catch (err) {
                    ctx.reject();
                }
            }).on('ready', () => {
                try {
                    client.on('session', (accept, _reject) => {
                        try {
                            const session = accept();
                            session.on('sftp', (accept, _reject) => {
                                const sftp = accept();
                                let paths = [];
                                sftp.on('OPEN', async (reqid, filename, _flags, _attrs) => {
                                    try {
                                        const path = DOWNLOAD_DIR + options.productCode + (options.fromPath || '') + filename;
                                        paths.push(path);
                                        sftp.handle(reqid, Buffer.from(path));
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                }).on('READ', async (reqid, handle, _offset, _length) => {
                                    try {
                                        const path = handle.toString('utf8');
                                        await checkDir(path);
                                        const file = await readFileSync(path);
                                        if (paths.includes(path)) {
                                            sftp.data(reqid, file);
                                            paths = paths.filter(p => p !== path);
                                        } else {
                                            sftp.status(reqid, STATUS_CODE.EOF);
                                        }
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                }).on('WRITE', async (reqid, handle, offset, data) => {
                                    try {
                                        const path = Buffer.from(handle).toString('utf8');
                                        await checkDir(path);
                                        await promises.writeFile(path, data, 'binary');
                                        sftp.status(reqid, STATUS_CODE.OK);
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                }).on('REMOVE', async (reqid, handle, _offset, _data) => {
                                    try {
                                        const path = Buffer.from(handle).toString('utf8');
                                        const from = DOWNLOAD_DIR + options.productCode + (options.fromPath || '') + path;
                                        await checkDir(from);
                                        await unlinkSync(from);
                                        sftp.status(reqid, STATUS_CODE.OK);
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                }).on('CLOSE', (reqid, _handle) => {
                                    try {
                                        sftp.status(reqid, STATUS_CODE.OK);
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                }).on('READDIR', async (reqid, handle) => {
                                    try {
                                        const path = handle.toString('utf8');
                                        const from = DOWNLOAD_DIR + options.productCode + (options.fromPath || '') + path;
                                        await checkDir(from);
                                        const files = await readdirSync(from);
                                        const name = files.map(filename => ({
                                            filename,
                                            attrs: {},
                                        }));
                                        if (!paths.includes(path)) {
                                            sftp.status(reqid, STATUS_CODE.EOF);
                                        } else {
                                            sftp.name(reqid, name);
                                            paths = paths.filter(p => p !== path);
                                        }
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                }).on('OPENDIR', async (reqid, path) => {
                                    try {
                                        paths.push(path);
                                        sftp.handle(reqid, Buffer.from(path));
                                        sftp.status(reqid, STATUS_CODE.OK);
                                    } catch (err) {
                                        winston.log('error', err.message);
                                        sftp.status(reqid, STATUS_CODE.FAILURE);
                                    }
                                });
                            });
                        } catch (err) {
                            winston.log('error', err.message);
                        }
                    });
                } catch (err) {
                    winston.log('error', err.message);
                }
            }).on('close', () => {
                // console.log('Client disconnected');
            });
        }).listen(options.port || 0, '0.0.0.0', function () {
            winston.log('info', 'Listening on port ' + this.address().port);
        });
    } catch (err) {
        winston.log('error', err.message);
    }

    return server;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'sftp-server',
    connect,
};
