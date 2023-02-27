'use strict';
/**
 * Module dependencies.
 */
const fs = require('fs');
const net = require('net');
const _ = require('lodash');
const ftp = require('basic-ftp');
const winston = require('../../logger.js');
const response = require('../lib/response');
const rp = require('request-promise');

/**
 * FTP library.
 *
 * Handles connection to server and file fetching.
 */

const clients = {};
const DOWNLOAD_DIR = './temp/';

/**
 * Generates random UUIDv4.
 *
 * @return {String}
 */
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

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
        await fs.promises.access(dst).then(() => true).catch(async () => await fs.promises.mkdir(dst, {recursive: true}));
    } catch (e) {
        console.log(e.message);
    }
};

/**
 * Downloads files by directory path.
 *
 * @param {String} client
 * @param {String} path
 * @param {String} productCode
 * @return {Array}
 */
const downloadFiles = async (client, path, productCode) => {
    let files;
    const filename = path.includes('.');
    try {
        files = await client.list(path);
    } catch (err) {
        files = [];
    }
    if (!Array.isArray(files)) { return; }
    if (path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }

    // Skip directories.
    files = (Array.isArray(files) ? files : [files]).filter(item => item.type !== 2);

    for (let i = 0; i < files.length; i++) {
        const from = path + (filename ? '' : (path !== '/' ? '/' : '') + files[i].name);
        const to = DOWNLOAD_DIR + productCode + from;
        await checkDir(to);
        try {
            // Download file.
            await client.downloadTo(to, from);
            // Attach dir.
            files[i].path = from;
            // Take only filename.
            files[i].name = files[i].name.split('/').pop();
            // Read file content.
            files[i].data = fs.readFileSync(to, 'base64');
        } catch (err) {
            winston.log('error', err.message);
        }
    }
    return files;
};

/**
 * Uploads a file by remote filepath.
 *
 * @param {String} client
 * @param {String} remotePath
 * @param {String} localPath
 * @return {String}
 */
const uploadFile = async (client, remotePath, localPath) => {
    if (remotePath.slice(-1) === '/') {
        remotePath = remotePath.slice(0, -1);
    }
    let upload;
    try {
        upload = await client.uploadFrom(DOWNLOAD_DIR + localPath, remotePath);
    } catch (err) {
        winston.log('error', err.message);
    }
    return upload;
};

/**
 * Deletes a file by remote filepath.
 *
 * @param {String} client
 * @param {String} path
 * @return {String}
 */
const deleteFile = async (client, path) => {
    if (path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }
    let upload;
    try {
        upload = await client.remove(path);
    } catch (err) {
        winston.log('error', err.message);
    }
    return upload;
};

/**
 * Creates SFTP client.
 *
 * @param {Object} config
 * @param {String} productCode
 * @param {String} clientId
 * @return {Object}
 */
const createClient = async (config = {}, productCode, clientId = uuidv4()) => {
    const options = {
        port: 21,
    };

    if (Object.hasOwnProperty.call(config.authConfig, 'url')) {
        config.authConfig.url !== '${url}' ? options.host = config.authConfig.url : null;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'url')) {
        config.authConfig.secure !== '${secure}' ? options.secure = config.authConfig.secure : false;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'port')) {
        config.authConfig.port !== '${port}' ? options.port = Number.parseInt(config.authConfig.port) : null;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'username')) {
        config.authConfig.username !== '${username}' ? options.user = config.authConfig.username : null;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'password')) {
        config.authConfig.password !== '${password}' && !!config.authConfig.password ? options.password = config.authConfig.password : null;
    }

    if (!Object.hasOwnProperty.call(clients, productCode)) {
        clients[productCode] = {};
    }

    if (!Object.hasOwnProperty.call(clients[productCode], clientId)) {
        clients[productCode][clientId] = new ftp.Client();
    }

    // Convert secure from string to boolean.
    // secure (boolean | "implicit") Explicit FTPS over TLS, default: false. Use "implicit" if you need support for legacy implicit FTPS.
    options.secure = options.secure === 'true' ? true : options.secure;
    options.secure = options.secure === 'false' ? false : options.secure;

    options.secureOptions = {
        rejectUnauthorized: !net.isIP(options.host),
    };

    await clients[productCode][clientId].access(options);
    return clients[productCode][clientId];
};

/**
 * Handles request to consume data sent TO connector (from SFTP server).
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @param {Boolean} skipHandling
 * @return {Promise}
 */
const getData = async (config = {}, pathArray, skipHandling = false) => {
    const productCode = config.productCode || uuidv4();
    const clientId = uuidv4();
    let toPath = config.authConfig.toPath || '';
    const items = [];

    // Detect produced content.
    try {
        if (config.parameters.targetObject.content || config.parameters.targetObject.url) {
            const doc = config.parameters.targetObject;
            const encoding = config.parameters.targetObject.categorizationEncoding || 'binary';

            // Fetch content.
            const url = doc.url;
            const response = url ? await rp({method: 'GET', url, resolveWithFullResponse: true, encoding: null}) : {body: doc.content};
            const content = response.body;

            // Write file to filesystem.
            const path = '/' + doc.name;
            const to = DOWNLOAD_DIR + config.productCode + (config.authConfig.fromPath || '') + path;
            await checkDir(to);
            await fs.promises.writeFile(to, Buffer.from(content, encoding), 'binary');

            // Upload file to SFTP server.
            await sendData(config, [path], clientId);
            toPath = config.authConfig.fromPath || '';
        }
    } catch (err) {
        winston.log('error', err.message);
    }

    const client = await createClient(config, productCode, clientId);
    for (let p = 0; p < pathArray.length; p++) {
        const name = pathArray[p][0] === '/' ? pathArray[p] : '/' + pathArray[p];
        const paths = Array.isArray(toPath) ? toPath : [toPath];
        for (let l = 0; l < paths.length; l++) {
            let files = await downloadFiles(client, paths[l] + name, productCode);
            if (!files) { continue; }
            files = (Array.isArray(files) ? files : [files]).filter(item => item.type !== 2);
            for (let f = 0; f < files.length; f++) {
                if (_.isObject(files[f])) {
                    files[f].id = files[f].name;
                }
                const item = skipHandling ? files[f] : await response.handleData(config, pathArray[p], p, files[f]);
                if (item) { items.push(item); }
            }
        }
    }

    await client.close();
    delete clients[productCode][clientId];
    if (JSON.stringify(clients[productCode] === '{}')) {
        delete clients[productCode];
    }
    return items;
};

/**
 * Handles request to produce data FROM connector (to SFTP server).
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @param {String} clientId
 * @return {Promise}
 */
const sendData = async (config = {}, pathArray, clientId) => {
    const productCode = config.productCode || uuidv4();
    const client = await createClient(config, productCode, clientId);

    const items = [];
    const fromPath = (Array.isArray(config.authConfig.fromPath) ? config.authConfig.fromPath[0] : config.authConfig.fromPath) || '';

    for (let p = 0; p < pathArray.length; p++) {
        const item = await uploadFile(client, fromPath + pathArray[p], productCode + fromPath + pathArray[p]);
        if (item) { items.push(item); }
    }

    await client.close();
    return items;
};

/**
 * Moves received file to another path at SFTP server.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @param {String} clientId
 * @param {String} newPath
 * @return {Promise}
 */
const move = async (config = {}, pathArray, clientId, newPath = '') => {
    const productCode = config.productCode || uuidv4();
    const client = await createClient(config, productCode, clientId);

    const items = [];
    const toPath = (Array.isArray(config.authConfig.toPath) ? config.authConfig.toPath[0] : config.authConfig.toPath) || '';

    for (let p = 0; p < pathArray.length; p++) {
        const name = pathArray[p][0] === '/' ? pathArray[p] : '/' + pathArray[p];
        // Upload to new path.
        const item = await uploadFile(client, newPath + name, productCode + toPath + name);
        try {
            await downloadFiles(client, newPath + name, productCode);
        } catch (err) {
            winston.log('error', err.message);
        }
        // Remove from old path
        if (item) {
            await deleteFile(client, toPath + name);
            items.push(item);
        }
    }

    await client.close();
    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
    sendData,
    checkDir,
    move,
};
