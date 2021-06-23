'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rp = require('request-promise');

/**
 * Streamer.
 *
 * Publishes received data to external system.
 */

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} headers
 * @param {String/Object/Array} body
 * @return {Promise}
 */
function request (method, url, headers, body) {
    const options = {
        method: method,
        uri: url,
        json: true,
        body: body,
        resolveWithFullResponse: true,
        headers: headers,
    };

    return rp(options).then(result => Promise.resolve(result))
        .catch((error) => {
            return Promise.reject(error);
        });
}

/**
 * Attempts to stream data to external system.
 *
 * @param {Object} template
 * @param {Object} data
 * @return {Object}
 */
const stream = async (template, data) => {
    const result = [];
    try {
        // Extract stream endpoint url and output definitions from config.
        const config = template.config;
        let url = config.plugins;
        url = url ? config.plugins.streamer : null;
        url = url ? config.plugins.streamer.url : null;
        url = url || config.static.url;
        let headers = config.plugins;
        headers = headers ? config.plugins.streamer : null;
        headers = headers ? config.plugins.streamer.headers : null;
        headers = headers || config.static.headers || {};
        if (!url) return data;
        const objectKey = template.output.object || 'data';
        const arrayKey = template.output.array || 'sensors';
        // Send data to external system.
        for (const d of (Array.isArray(data) ? data : [data])) {
            if (Array.isArray(d[objectKey][arrayKey])) {
                if (d[objectKey][arrayKey].length === 0) continue;
            }
            if (url && d[objectKey][arrayKey]) {
                result.push(await request('POST', url, headers, d[objectKey][arrayKey]));
            }
        }
    } catch (err) {
        winston.log('error', err.message);
        throw err;
    }
    return result;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'streamer',
    stream,
};
