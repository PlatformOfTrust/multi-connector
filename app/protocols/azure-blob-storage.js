
'use strict';
/**
 * Module dependencies.
 */
const Readable = require('stream').Readable;
const response = require('../lib/response');
const {BlobServiceClient, StorageSharedKeyCredential} = require('@azure/storage-blob');

/**
 * Azure Blob Storage library.
 *
 * Handles connection to server and file fetching.
 */
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = {bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20};

// A helper method used to read a Node.js readable stream into a Buffer.
async function streamToBuffer (readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

/**
 * Creates blob service container client.
 *
 * @param {Object} config
 * @return {Object}
 */
const createClient = async (config = {}) => {
    const options = {};

    if (Object.hasOwnProperty.call(config.authConfig, 'account')) {
        options.account = config.authConfig.account;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'accountKey')) {
        options.accountKey = config.authConfig.accountKey;
    }

    if (Object.hasOwnProperty.call(config.authConfig, 'container')) {
        options.container = config.authConfig.container;
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(options.account, options.accountKey);

    // List containers.
    const blobServiceClient = new BlobServiceClient(
        // When using AnonymousCredential, following url should include a valid SAS or support public access.
        `https://${options.account}.blob.core.windows.net`,
        sharedKeyCredential,
    );

    let containerClient;

    for await (const container of blobServiceClient.listContainers()) {
        if (container.name === options.container) {
            containerClient = blobServiceClient.getContainerClient(options.container);
        }
    }
    return containerClient;
};

/**
 * Handles Blob Storage data request from connector.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const getData = async (config = {authConfig: {}}, pathArray) => {
    const items = [];
    const containerClient = await createClient(config);

    if (containerClient) {
        // Download blobs.
        if (JSON.stringify(pathArray) === '[""]') {
            for await (const blob of containerClient.listBlobsFlat()) {
                const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                try {
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);
                    const data = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');
                    const item = await response.handleData(config, blob.name, 0, {data, id: blob.name});
                    if (item) items.push(item);
                } catch (e) {
                    // Blob was not found.
                }
            }
        } else {
            for (let p = 0; p < pathArray.length; p++) {
                const blockBlobClient = containerClient.getBlockBlobClient(pathArray[p]);
                try {
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);
                    const data = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');
                    const item = await response.handleData(config, pathArray[p], p, {data, id: pathArray[p]});
                    if (item) items.push(item);
                } catch (e) {
                    // Blob was not found.
                }
            }
        }
    }
    return items;
};

/**
 * Handles request to produce data FROM connector (to SFTP server).
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const sendData = async (config = {}, pathArray) => {
    const items = [];
    const containerClient = await createClient(config);

    if (containerClient) {
        for (let p = 0; p < pathArray.length; p++) {
            const stream = new Readable();
            stream.push(JSON.stringify(pathArray[p].data));
            stream.push(null);
            const blockBlobClient = containerClient.getBlockBlobClient(pathArray[p].id + '.json');
            const data = await blockBlobClient.uploadStream(stream,
                uploadOptions.bufferSize, uploadOptions.maxBuffers,
                {blobHTTPHeaders: {blobContentType: 'application/json'}});
            if (data) { items.push(pathArray[p]); }
        }
    }
    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
    sendData,
};
