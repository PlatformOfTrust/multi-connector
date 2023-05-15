'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const {getData, sendData, remove} = require('../../app/protocols/azure-blob-storage');
const slack = require('../../app/protocols/slack');

/**
 * Retry library for connectors delivering data using files.
 */

const container = process.env.AZURE_BLOB_STORAGE_CONTAINER || 'retries';
const validateCredentials = () => !(
    !process.env.AZURE_BLOB_STORAGE_ACCOUNT
        || !process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY
);
const MAX_ATTEMPTS = 5;

/**
 * Logs message and sends a slack message.
 *
 * @param {String} level
 * @param {String} data
 * @param {String} [id]
 * @param {String} [error]
 */
const log = (level, data, id, error) => {
    winston.log(level, `${id ? `${id}: ` : ''}${data}`);
    if (process.env.SLACK_HOOK_URL) {
        slack.sendData({
            authConfig: {
                url: process.env.SLACK_HOOK_URL,
            },
            plugins: [],
        }, [{id, data, error}]);
    }
};

/**
 * Uploads file to blob storage.
 *
 * @param {String} id
 * @param {String} name
 * @param {Buffer} content
 * @param {Object} metadata
 * @return {Promise}
 */
const upload = async (id, name, content, metadata = {attempts: '0'}) => {
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
            const attemptValue = ((file[i] || {}).metadata || {}).attempts || '0';
            const attemptCount = !Number.isNaN(Number.parseInt(attemptValue)) ? Number.parseInt(attemptValue) : 0;
            if (attemptCount >= MAX_ATTEMPTS) {
                continue;
            }
            const id = (file[i] || {}).id;
            const currentAttempt = attemptCount + 1;
            await callback(file[i], async (err, _result) => {
                if (!err) {
                    // Remove file as callback was successful.
                    log('info', `Retry attempt #${currentAttempt} was successful`, id);
                    await remove({
                        authConfig: {
                            account: process.env.AZURE_BLOB_STORAGE_ACCOUNT,
                            accountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
                            container,
                        },
                    }, [file[i].id]);
                } else {
                    log('error', `Retry attempt #${currentAttempt} failed${currentAttempt >= MAX_ATTEMPTS ? ' (max. retry attempts reached)' : ''}`, id, err);
                    // Increase attempt count.
                    await upload('', file[i].id, Buffer.from(file[i].data, 'base64'), {attempts: currentAttempt.toString()});
                }
            });
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
