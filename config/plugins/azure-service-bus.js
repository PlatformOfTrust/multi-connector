'use strict';
/**
 * Module dependencies.
 */
const rp = require('request-promise');

/**
 * Azure Service Bus.
 *
 * Broadcasts data to Azure.
 *
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
 * Attempts to stream data to Azure.
 *
 * @param {Object} config
 * @param {Object} data
 * @return {Object}
 */
const stream = async (config, data) => {
    try {
        // Extract stream endpoint url and output definitions from config.
        const url = config.url;
        const objectKey = config.output.object;
        const arrayKey = config.output.array;
        // Send data to azure.
        for (const d of (Array.isArray(data) ? data : [data])) {
            if (url) await request('POST', url, {}, d[objectKey][arrayKey]);
        }
    } catch (err) {
        // console.log(err.message);
    }
    return data;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'azure-service-bus',
    stream,
};
