'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rsa = require('../../app/lib/rsa');
const rp = require('request-promise');
const moment = require('moment');
const crypto = require('crypto');

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
        let env = 'sandbox';
        const config = template.config;

        // Try to parse env from the config.
        try {
            env = config.plugins.broker.env;
        } catch (err) {
            winston.log('error', err.message);
        }

        // Find env specific broker URL.
        const url = brokerURLs.find(i => i.env === (env || 'sandbox')).url;

        /** Output definitions from config. */
        const objectKey = template.output.object || 'data';
        const arrayKey = template.output.array;
        data = Array.isArray(data) ? data : [data];

        for (let i = 0; i < data.length; i++) {
            const productCode = config.static.productCode;
            if (!productCode) continue;

            if (url) {
                const body = {
                    productCode,
                    timestamp: moment().format(),
                    parameters: {
                        targetObject: data[i][objectKey][arrayKey],
                    },
                };

                // Pass connector product code as sender.
                body.parameters.targetObject.sender = {
                    '@type': 'DataProduct',
                    productCode: config.productCode,
                };

                // Initialize signature value.
                let signatureValue;

                // Load PoT credentials from env by default.
                let clientSecret = process.env.POT_CLIENT_SECRET;
                let appAccessToken = process.env.POT_APP_ACCESS_TOKEN;

                // Try to parse credentials from the config.
                try {
                    clientSecret = config.plugins.broker.clientSecret;
                    appAccessToken = config.plugins.broker.appAccessToken;
                } catch (err) {
                    winston.log('error', err.message);
                }

                const accessToken = process.env.POT_ACCESS_TOKEN || appAccessToken;

                /** Validate PoT credentials */
                if (!clientSecret || !appAccessToken) {
                    const err = new Error('Unauthorized to send broker request. Application credentials not configured properly.');
                    err.httpStatusCode = 500;
                    return Promise.reject(err);
                }

                // Create SHA256 signature in base64 encoded format.
                try {
                    signatureValue = crypto
                        .createHmac('sha256', Buffer.from(clientSecret, 'utf8'))
                        .update(rsa.stringifyBody(body)).digest('base64');
                } catch (err) {
                    winston.log('error', err.message);
                }

                // Set request headers
                const headers = {
                    'X-Pot-Signature': signatureValue,
                    'X-App-Token': appAccessToken,
                    'X-User-Token': accessToken,
                    'Content-Type': 'application/json',
                };

                // Send broker request .
                winston.log('info', 'Broker plugin: Send broker request by product code ' + productCode + ', ' + url);
                await request('POST', url, headers, body);
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
