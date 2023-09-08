'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const crypto = require('crypto');
const rp = require('request-promise');
const rsa = require('../../app/lib/rsa');

/**
 * Plugin to perform RSA validation on received data.
 */

/** Import Platform of Trust definitions. */
const {brokerURLs} = require('../../config/definitions/pot');

/**
 * Validates response signature.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    let output = null;
    try {
        if (!_.isObject(response)) {
            return response;
        }
        const body = await rp({method: 'GET', url: response.signature.creator});
        const publicKey = body.toString();

        // Verify payload and signature against public key.
        output = rsa.verifySignature({
            __signed__: response.signature.created,
            ...(response.data || response.message),
        }, response.signature.signatureValue, publicKey)
        || rsa.verifySignature({
            __signed__: response.signature.created,
            ...(response.data || response.message),
        }, response.signature.signatureValue, publicKey, false) ? response : null;

    } catch (err) {
        console.log(err.message);
    }
    return output;
};



/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'rsa',
    request: async (config, options) => {
        let headers;
        try {
            const parameters = config.plugins.find(p => p.name === 'rsa').options;
            let env = 'sandbox';
            let url;
            // Try to parse env from the config.
            try {
                // Find env specific broker URL.
                env = parameters.env;
                url = (brokerURLs.find(i => i.env === (env || 'sandbox'))
                    || {url: 'http://localhost:8080/translator/v1/fetch'}).url;
            } catch (err) {
                console.log(err.message);
            }

            // Load PoT credentials from env by default.
            let clientSecret = process.env.POT_CLIENT_SECRET;
            let appAccessToken = process.env.POT_APP_ACCESS_TOKEN;

            // Try to parse credentials from the config.
            try {
                clientSecret = parameters.clientSecret || clientSecret;
                appAccessToken = parameters.appAccessToken || appAccessToken;
            } catch (err) {
                console.log(err.message);
            }

            const accessToken = process.env.POT_ACCESS_TOKEN || appAccessToken;

            // Initialize signature value.
            let signatureValue;
            try {
                signatureValue = crypto
                    .createHmac('sha256', Buffer.from(clientSecret !== undefined ? clientSecret : '', 'utf8'))
                    .update(rsa.stringifyBody(options.body)).digest('base64');
            } catch (err) {
                console.log(err.message);
            }

            // Set request headers
            headers = {
                'X-Pot-Signature': signatureValue,
                'X-App-Token': appAccessToken,
                'X-User-Token': accessToken,
            };

            if (options.url === '${url}') {
                options.url = url;
            }

        } catch (err) {
            headers = {};
        }

        // Include signature.
        options.headers = {...options.headers, ...headers};
        return options;
    },
    response,
};
