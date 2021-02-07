'use strict';
/**
 * Module dependencies.
 */
const rp = require('request-promise');

/** Import Platform of Trust definitions. */
const {brokerURLs} = require('../../config/definitions/pot');

/**
 * Broker.
 *
 * Sends received data to broker.
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
 * Attempts to sent data to Platform of Trust broker.
 *
 * @param {Object} config
 * @param {Object} data
 * @return {Object}
 */
const stream = async (config, data) => {
    try {
        const url = brokerURLs.find(i => i.env === config.env).map(j => j.url);
        console.log('Broker plugin.');
        // TODO: Broker request.
        if (config.action === 'consume') console.log('Send data to' + url);
        // Extract stream endpoint url and output definitions from config.
        const objectKey = config.output.object;
        const arrayKey = config.output.array;
        /*
        // Send data to broker.
        for (const d of (Array.isArray(data) ? data : [data])) {
            if (url) await request('POST', url, {}, d[objectKey][arrayKey]);
        }
        */
    } catch (err) {
        // console.log(err.message);
    }
    return data;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'broker',
    stream,
};
