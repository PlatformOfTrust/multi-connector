'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rp = require('request-promise');
const moment = require('moment');

/** Import Platform of Trust definitions. */
const {brokerURLs} = require('../../config/definitions/pot');

/**
 * Broker.
 *
 * Publishes received data to broker.
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
 * @param {Object} template
 * @param {Object} data
 * @return {Object}
 */
const stream = async (template, data) => {
    try {
        // Extract stream endpoint url and output definitions from config.
        const config = template.config;
        const url = config.static.env === 'development' ? config.connectorURL + '/translator/v1/fetch' : brokerURLs.find(i => i.env === (config.env || 'sandbox')).url;
        const objectKey = template.output.object || 'data';
        const arrayKey = template.output.array;
        data = Array.isArray(data) ? data : [data];
        for (let i = 0; i < data.length; i++) {

            // TODO: Change to broker request.

            const productCode = config.static.productCode;
            if (!productCode) continue;
            const result = {
                productCode,
                timestamp: moment().format(),
                parameters: {
                    targetObject: data[i][objectKey][arrayKey],
                },
            };

            // Send data to broker API.
            if (url) {
                winston.log('info', 'Broker plugin: Send data to broker by product code ' + productCode + ', ' + url);
                await request('POST', url, {}, result);
            }
        }
    } catch (err) {
        winston.log('error', err.message);
        throw err;
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
