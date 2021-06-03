'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const rsa = require('../../app/lib/rsa');
const cache = require('../../app/cache');

/**
 * Plugin to perform RSA validation on received data.
 */

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
        const url = config.authConfig.url;
        const publicKeys = (cache.getDocs('publicKeys') || []).sort((a, b) => (a.priority > b.priority) ? 1 : -1).filter(c => c.url.startsWith(url));

        // Include connectors public key.
        publicKeys.push({
            url: config.authConfig.connectorURL + '/translator/v1/public.key',
            key: rsa.getPublicKey(),
            env: 'local',
            priority: publicKeys.length,
        });

        /** Signature validation */
        config.rsa = {
            verified: false,
        };

        // Verify payload and signature against public keys.
        for (let i = 0; i < publicKeys.length; i++) {
            if (config.rsa.verified) continue;
            if (rsa.verifySignature({
                __signed__: response.signature.created,
                ...(response.data || response.message),
            }, response.signature.signatureValue, publicKeys[i].key)) {
                config.rsa.verified = true;
                config.rsa.environment = publicKeys[i].env;
                config.rsa.url = publicKeys[i].url;
            }
        }
        output = config.rsa.verified ? response : null;
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
    response,
};
