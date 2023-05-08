'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const {getData, sendData, remove} = require('../../app/protocols/azure-blob-storage');

/**
 * Retry library for connectors delivering data using files.
 */

const container = process.env.AZURE_BLOB_STORAGE_CONTAINER || 'retries';
const validateCredentials = () => !(
    !process.env.AZURE_BLOB_STORAGE_ACCOUNT
        || !process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY
);

/**
 * Uploads file to blob storage.
 *
 * @param {String} id
 * @param {String} name
 * @param {Buffer} content
 * @param {Object} metadata
 * @return {Promise}
 */
const upload = async (id, name, content, metadata = {attempts: '1'}) => {
    if (!validateCredentials()) {
        return Promise.reject(new Error('Missing retry credentials.'));
    }
    const filename = `${id}${id ? '/' : ''}${name.split('/')[0] === '' ? name.substring(1) : name}`;
    // Upload file to blob storage.
    winston.log('info', `Update ${filename}`);
    const result = await sendData({
        authConfig: {
            account: process.env.AZURE_BLOB_STORAGE_ACCOUNT,
            accountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
            container,
        },
    }, [{filename, content, metadata}], true);
    if (result.length > 0) {
        return Promise.resolve(result);
    } else {
        winston.log('info', `Failed to update ${filename}`);
        return Promise.reject();
    }
};

/**
 * Downloads files from blob storage.
 *
 * @param {String} id
 * @param {String} name
 * @return {Promise}
 */
const download = async (id, name = '') => {
    if (!validateCredentials()) {
        return Promise.reject(new Error('Missing retry credentials.'));
    }
    const filename = `${id}${id ? '/' : ''}${name.split('/')[0] === '' ? name.substring(1) : name}`;
    return await getData({
        authConfig: {
            account: process.env.AZURE_BLOB_STORAGE_ACCOUNT,
            accountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
            container,
        },
        parameters: {
            targetObject: {},
        },
    }, [filename], true);
};

/**
 * Triggers retry for all files by id.
 *
 * @param {String} id
 * @param {Function} callback
 */
const retry = async (id, callback) => {
    if (!validateCredentials()) {
        return Promise.reject(new Error('Missing retry credentials.'));
    }
    // Check for blobs and retry.
    download(id).then(async (file) => {
        // Try again.
        for (let i = 0; i < file.length; i++) {
            const attemptValue = ((file[i] || {}).metadata || {}).attempts || '1';
            let attemptCount = !Number.isNaN(Number.parseInt(attemptValue)) ? Number.parseInt(attemptValue) : 1;
            if (attemptCount >= 5) {
                continue;
            }
            winston.log('info', `Attempt to handle ${(file[i] || {}).id} #${attemptCount}`);
            const success = await callback(file[i]);
            if (success) {
                // Remove file as callback was successful.
                winston.log('info', `Remove ${(file[i] || {}).id}`);
                await remove({
                    authConfig: {
                        account: process.env.AZURE_BLOB_STORAGE_ACCOUNT,
                        accountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
                        container,
                    },
                }, [file[i].id]);
            } else {
                // Increase attempt count as callback failed.
                attemptCount += 1;
                await upload('', file[i].id, Buffer.from(file[i].data, 'base64'), {attempts: attemptCount.toString()});
            }
        }
    }).catch(err => {
        winston.log('error', `Retry: ${err.message}`);
    });
};

/**
 * Adds a file to blob storage for retry.
 *
 * @param {String} id
 * @param {Object} input
 * @param {Function} callback
 */
const add = async (id, input, callback) => {
    if (!validateCredentials()) {
        return Promise.reject(new Error('Missing retry credentials.'));
    }
    if (typeof input !== 'object') {
        return Promise.reject(new Error(`Invalid input. Expected object, got ${typeof input}.`));
    }
    upload(id, input.path, Buffer.from(input.data, 'base64')).then(() => {
        // Confirm successful move to blob storage by executing the callback.
        callback();
    }).catch(err => {
        winston.log('error', `Add: ${err.message}`);
    });
};

module.exports = {
    add,
    get: async (name) => download('', name),
    retry,
};
