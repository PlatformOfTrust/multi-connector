'use strict';
/**
 * Module dependencies.
 */
const fs = require('fs');
const _ = require('lodash');
const rp = require('request-promise');
const winston = require('../../logger.js');
const Client = require('ssh2-sftp-client');
const response = require('../lib/response');
const SocksClient = require('socks').SocksClient;

/**
 * SFTP library.
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
        const r = Math.random() * 16 | 0; const v = c == 'x' ? r : (r & 0x3 | 0x8);
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
    let filename = false;
    try {
        // Try path as a directory.
        files = await client.list(path);
    } catch (err) {
        try {
            // Try path as a filename.
            const parts = path.split('/');
            parts.pop();
            files = (await client.list(parts.join('/')))
                .filter(file => path.split('/').includes(file.name));
            filename = true;
        } catch (err) {
            winston.log('error', err.message);
            return;
        }
    }
    if (!Array.isArray(files)) return;
    if (path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }
    for (let i = 0; i < files.length; i++) {
        const from = path + (filename ? '' : '/' + files[i].name);
        const to = DOWNLOAD_DIR + productCode + from;
        await checkDir(to);
        let filePath;
        try {
            // Download file.
            filePath = await client.get(from, to);
            // Read file content.
            files[i].data = fs.readFileSync(filePath, 'base64');
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
 * @param {String} path
 * @param {String} productCode
 * @return {String}
 */
const uploadFile = async (client, path, productCode) => {
    if (path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }
    let upload;
    try {
        upload = client.put(DOWNLOAD_DIR + productCode, path);
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
 * @return {Object}
 */
const createClient = async (config= {}, productCode) => {
    const options = {};

    if (Object.hasOwnProperty.call(config.authConfig, 'url')) {
        options.host = config.authConfig.url;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'port')) {
        options.port = Number.parseInt(config.authConfig.port);
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'username')) {
        options.username = config.authConfig.username;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'password')) {
        options.password = config.authConfig.password;
    }

    if (!Object.hasOwnProperty.call(clients, productCode)) {
        clients[productCode] = new Client(productCode);
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'proxyHost')) {
        if (config.authConfig.proxyHost !== '${proxyHost}') {
            const proxy = {
                host: config.authConfig.proxyHost, // Proxy hostname.
                port: Number.parseInt(config.authConfig.proxyPort || '1080'), // Proxy port.
                type: 5, // for SOCKS v5.
            };

            // Connect to SOCKS 5 proxy.
            const instance = await SocksClient.createConnection({
                proxy,
                command: 'connect',
                destination: {
                    // Remote SFTP server.
                    host: options.host,
                    port: options.port,
                },
            });
            options.sock = instance.socket;
        }
    }

    await clients[productCode].connect(options);
    return clients[productCode];
};

/**
 * Handles request to consume data sent TO connector (from SFTP server).
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const getData = async (config= {}, pathArray) => {
    const productCode = config.productCode || uuidv4();
    let toPath = config.authConfig.toPath || '';
    const items = [];

    // Detect produced content.
    try {
        if (config.parameters.targetObject.content || config.parameters.targetObject.url) {
            const doc = config.parameters.targetObject;

            // Fetch content.
            const url = doc.url;
            const response = url ? await rp({method: 'GET', url, resolveWithFullResponse: true, encoding: null}) : {body: doc.content};
            const content = response.body;

            // Write file to filesystem.
            const path = '/' + doc.name;
            const to = DOWNLOAD_DIR + config.productCode + (config.authConfig.fromPath || '') + path;
            await checkDir(to);
            await fs.promises.writeFile(to, Buffer.from(content, 'binary'), 'binary');

            // Upload file to SFTP server.
            await sendData(config, [path]);
            toPath = config.authConfig.fromPath || '';
        }
    } catch (err) {
        winston.log('error', err.message);
    }

    const client = await createClient(config, productCode);
    for (let p = 0; p < pathArray.length; p++) {
        let files = await downloadFiles(client, toPath + pathArray[p], productCode);
        if (!files) continue;
        files = Array.isArray(files) ? files : [files];
        for (let f = 0; f < files.length; f++) {
            if (_.isObject(files[f])) {
                files[f].id = files[f].name;
            }
            const item = await response.handleData(config, pathArray[p], p, files[f]);
            if (item) items.push(item);
        }
    }

    await client.end();
    return items;
};

/**
 * Handles request to produce data FROM connector (to SFTP server).
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const sendData = async (config= {}, pathArray) => {
    const productCode = config.productCode || uuidv4();
    const client = await createClient(config, productCode);

    const items = [];
    const fromPath = config.authConfig.fromPath || '';

    for (let p = 0; p < pathArray.length; p++) {
        const item = await uploadFile(client, fromPath + pathArray[p], productCode + fromPath + pathArray[p]);
        if (item) items.push(item);
    }

    await client.end();
    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
    sendData,
    checkDir,
};
