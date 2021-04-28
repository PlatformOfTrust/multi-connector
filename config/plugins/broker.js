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
    let parameters;
    try {
        // Include parameters defined in config.
        parameters = template.config.plugins.broker.parameters;
    } catch (err) {
        parameters = {};
    }

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
        const url = (brokerURLs.find(i => i.env === (env || 'sandbox'))
            || {url: 'http://localhost:8080/translator/v1/fetch'}).url;

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
                        ...parameters,
                        targetObject: data[i][objectKey][arrayKey],
                    },
                };

                // Load PoT credentials from env by default.
                let clientSecret = process.env.POT_CLIENT_SECRET;
                let appAccessToken = process.env.POT_APP_ACCESS_TOKEN;

                // Try to parse credentials from the config.
                try {
                    clientSecret = config.plugins.broker.clientSecret || clientSecret;
                    appAccessToken = config.plugins.broker.appAccessToken || appAccessToken;
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

                let requests = Array.isArray(body.parameters.targetObject) ? body.parameters.targetObject.map((o) => {
                    return {
                        ...body,
                        parameters: {
                            ...body.parameters,
                            targetObject: o,
                        },
                    };
                },
                ) : [body];

                requests = requests.map((o) => {
                    // Pass product codes as sender and receiver.
                    o.parameters.targetObject.sender = {
                        '@type': 'DataProduct',
                        productCode: config.productCode,
                    };
                    /*
                    o.parameters.targetObject.receiver = {
                        '@type': 'DataProduct',
                        productCode: productCode,
                    };
                    */
                    return o;
                });

                for (let r = 0; r < requests.length; r++) {
                    // Send broker request.
                    winston.log('info', 'Broker plugin: Send broker request to ' + url);

                    // Initialize signature value.
                    let signatureValue;

                    // Create SHA256 signature in base64 encoded format.
                    try {
                        signatureValue = crypto
                            .createHmac('sha256', Buffer.from(clientSecret, 'utf8'))
                            .update(rsa.stringifyBody(requests[r])).digest('base64');
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

                    await request('POST', url, headers, requests[r]);
                }
            }
        }
    } catch (err) {
        const error = new Error('External translator returns an invalid response.');
        error.httpStatusCode = 500;
        error.translator_response = err.error;
        winston.log('error', err.message);
        throw error;
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
