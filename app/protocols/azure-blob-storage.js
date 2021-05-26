
'use strict';
/**
 * Module dependencies.
 */
const response = require('../lib/response');
const {BlobServiceClient, StorageSharedKeyCredential} = require('@azure/storage-blob');

/**
 * Azure Blob Storage library.
 *
 * Handles connection to server and file fetching.
 */

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
 * Handles Blob Storage data request from connector.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const getData = async (config= {authConfig: {}}, pathArray) => {

    const options = {};

    // const productCode = config.productCode || 'default';

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

    const items = [];

    if (containerClient) {
        /*
        // List blobs.
        i = 1;
        for await (const blob of containerClient.listBlobsFlat()) {
            console.log(`Blob ${i++}: ${blob.name}`);
        }
        */

        // Download blob.
        for (let p = 0; p < pathArray.length; p++) {
            const blockBlobClient = containerClient.getBlockBlobClient(pathArray[p]);
            try {
                const downloadBlockBlobResponse  = await blockBlobClient.download(0);
                const data = (await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)).toString('base64');
                const item = await response.handleData(config, pathArray[p], p, {data, id: pathArray[p]});
                if (item) items.push(item);
            } catch (e) {
                // Blob was not found.
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
};
