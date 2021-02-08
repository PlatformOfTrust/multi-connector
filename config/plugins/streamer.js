'use strict';
/**
 * Module dependencies.
 */
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
    try {
        // Extract stream endpoint url and output definitions from config.
        const config = template.config;
        const url = config.static.url;
        if (!url) return data;
        // console.log(config);
        const objectKey = template.output.object || 'data';
        const arrayKey = template.output.array;
        // Send data to azure.
        for (const d of (Array.isArray(data) ? data : [data])) {
            console.log('Produce data to ' + url);
            if (url) await request('POST', url, {}, d[objectKey][arrayKey]);
        }
    } catch (err) {
        console.log(err.message);
    }
    return data;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'streamer',
    stream,
};
