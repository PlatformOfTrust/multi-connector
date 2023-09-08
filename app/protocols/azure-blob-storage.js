
'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const rp = require('request-promise');
const Readable = require('stream').Readable;
const response = require('../lib/response');
const file = require('../../config/plugins/document').response;
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
 * @param {Boolean} meta
 * @return {Promise}
 */
const getData = async (config = {authConfig: {}}, pathArray, meta = false) => {
    const items = [];
    const containerClient = await createClient(config);

    if (containerClient) {
        // Download blobs.
        if (JSON.stringify(pathArray) === '[""]' || JSON.stringify(pathArray) === '["/"]') {
            for await (const blob of containerClient.listBlobsFlat()) {
                const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                let metadata = {};
                try {
                    const properties = await blockBlobClient.getProperties();
                    metadata = properties.metadata;
                } catch (err) {
                    metadata = {};
                }
                try {
                    const downloadBlockBlobResponse = await blockBlobClient.download(0);
                    const data = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');
                    const item = await response.handleData(config, blob.name, 0, {data, id: blob.name, metadata});
                    if (item) items.push(item);
                } catch (e) {
                    // Blob was not found.
                }
            }
        } else {
            for (let p = 0; p < pathArray.length; p++) {
                if (pathArray[p].slice(-1) === '/' || pathArray[p] === '') {
                    for await (const blob of containerClient.listBlobsFlat()) {
                        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                        let metadata = {};
                        try {
                            const properties = await blockBlobClient.getProperties();
                            metadata = properties.metadata;
                        } catch (err) {
                            metadata = {};
                        }
                        try {
                            const downloadBlockBlobResponse = await blockBlobClient.download(0);
                            const data = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');
                            if (data && blob.name.startsWith(pathArray[p])) { items.push(meta ? {id: blob.name, data, metadata} : data); }
                        } catch (e) {
                            // Blob was not found.
                        }
                    }
                } else {
                    // Detect produced content.
                    try {
                        if (config.parameters.targetObject.content || config.parameters.targetObject.url) {
                            const doc = config.parameters.targetObject;

                            // Fetch content.
                            const url = doc.url;
                            const response = url ? await rp({method: 'GET', url, resolveWithFullResponse: true, encoding: null}) : {body: doc.content};
                            const content = response.body;
                            const filename = pathArray[p].split('/')[0] === '' && pathArray[p][0] === '/' ? pathArray[p].substring(1) : pathArray[p];
                            const {data} = await file({}, {id: filename, data: Buffer.from(content).toString('base64')});

                            data.metadata = {};
                            data.tags = {};

                            // Upload file to blob storage.
                            await sendData(config, [data]);
                        }
                    } catch (err) {
                        console.log(err.message);
                    }
                    const blockBlobClient = containerClient.getBlockBlobClient(pathArray[p]);
                    try {
                        const downloadBlockBlobResponse = await blockBlobClient.download(0);
                        let metadata = {};
                        try {
                            const properties = await blockBlobClient.getProperties();
                            metadata = properties.metadata;
                        } catch (err) {
                            metadata = {};
                        }
                        const data = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');
                        if (data) items.push(meta ? {id: pathArray[p], data, metadata} : await response.handleData(config, pathArray[p], p, {data, id: pathArray[p]}));
                    } catch (e) {
                        console.log(e.message);
                        // Blob was not found.
                    }
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
 * @param {Boolean} meta
 * @return {Promise}
 */
const sendData = async (config = {}, pathArray, meta = false) => {
    const items = [];
    const containerClient = await createClient(config);

    if (containerClient) {
        for (let p = 0; p < pathArray.length; p++) {
            if (meta) {
                // Create blob client from container client
                const blockBlobClient = await containerClient.getBlockBlobClient(pathArray[p].filename);
                let existingMetadata = {};
                try {
                    const properties = await blockBlobClient.getProperties();
                    existingMetadata = properties.metadata;
                } catch (err) {
                    existingMetadata = {};
                }
                const metadata = {...existingMetadata, ...(pathArray[p].metadata || {})};
                // Upload buffer
                const data = await blockBlobClient.uploadData(pathArray[p].content, {...uploadOptions, metadata});
                if (data) { items.push({filename: pathArray[p].filename, content: pathArray[p].content, metadata}); }
            } else {
                const stream = new Readable();
                stream.push(pathArray[p].encoding === 'base64' ? Buffer.from(pathArray[p].content, 'base64') : pathArray[p].content);
                stream.push(null);
                const blockBlobClient = containerClient.getBlockBlobClient(pathArray[p].filename);
                const data = await blockBlobClient.uploadStream(stream,
                    uploadOptions.bufferSize, uploadOptions.maxBuffers,
                    {
                        blobHTTPHeaders: {blobContentType: pathArray[p].mimetype},
                        metadata: pathArray[p].metadata,
                        tags: pathArray[p].tags,
                    });
                if (data) {
                    items.push(pathArray[p]);
                }
            }
        }
    }
    return items;
};

/**
 * Removes file at Blob Storage.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const remove = async (config = {}, pathArray) => {
    const items = [];
    const containerClient = await createClient(config);

    if (containerClient) {
        for (let p = 0; p < pathArray.length; p++) {
            let item;
            const name = pathArray[p];
            // Create blob client from container client
            const blockBlobClient = await containerClient.getBlockBlobClient(pathArray[p]);
            try {
                const options = {
                    deleteSnapshots: 'include',
                };
                item = await blockBlobClient.delete(options);
            } catch (err) {
                // Blob was not found or deleted.
                item = null;
            }
            if (item) {
                items.push({name});
            }
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
    remove,
};
