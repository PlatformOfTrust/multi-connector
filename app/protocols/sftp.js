'use strict';
/**
 * Module dependencies.
 */
const SocksClient = require('socks').SocksClient;
const winston = require('../../logger.js');
const Client = require('ssh2-sftp-client');

/**
 * SFTP library.
 *
 * Handles connection to server and file fetching.
 */

const clients = {};

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

const getFiles = (client, path) => {
    return client.list(path).then(data => {
        return Promise.resolve(data);
    }).catch(err => {
        winston.log('error', err.message);
        return Promise.resolve([]);
    });
};

/**
 * Handles SFTP data request from connector.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const getData = async (config= {}, pathArray) => {

    const options = {};
    const productCode = config.productCode || uuidv4();

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

    const items = [];
    for (let p = 0; p < pathArray.length; p++) {
        const item = await getFiles(clients[productCode], pathArray[p]);
        if (item) items.push(item);
    }

    await clients[productCode].end();

    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
};
