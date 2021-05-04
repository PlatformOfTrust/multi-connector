'use strict';
/**
 * Module dependencies.
 */
const fs = require('fs');
const winston = require('../../logger.js');
const Client = require('ssh2-sftp-client');
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
    try {
        files = await client.list(path);
    } catch (err) {
        winston.log('error', err.message);
    }
    if (!Array.isArray(files)) {
        return;
    }
    if (path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }
    for (let i = 0; i < files.length; i++) {
        const from = path + '/' + files[i].name;
        const to = DOWNLOAD_DIR + productCode + path + '/' + files[i].name;
        await checkDir(to);
        let filePath;
        try {
            // Download file.
            filePath = await client.get(from, to);
            // Read file content.
            files[i].data = fs.readFileSync(filePath, 'utf8');
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
    const client = await createClient(config, productCode);

    const items = [];
    const toPath = config.authConfig.toPath || '';

    for (let p = 0; p < pathArray.length; p++) {
        const item = await downloadFiles(client, toPath + pathArray[p], productCode);
        if (item) items.push(item);
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
        const item = await uploadFile(client, fromPath, productCode + fromPath + pathArray[p]);
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
};
