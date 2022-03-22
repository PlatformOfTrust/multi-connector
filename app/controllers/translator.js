'use strict';
/**
 * Module dependencies.
 */
const net = require('net');
const moment = require('moment');
const rsa = require('../lib/rsa');
const connector = require('../lib/connector');

/**
 * Translator controller.
 *
 * Handles fetching and returning of the data.
 */

/**
 * Returns the data to the PoT Broker API
 * based on the parameters sent.
 *
 * @param {Object} req
 * @param {Object} res
 * @return
 *   The translator data.
 */
module.exports.fetch = async (req, res) => {
    let result;
    try {
        // Set custom timeout.
        req.setTimeout(1000 * 60 * 5);

        // Fetch data.
        result = await connector.getData(req);

        // Initialize signature object.
        const signature = {
            type: 'RsaSignature2018',
            created: moment().format(),
            creator: req.publicKeyUrl,
        };

        // Send signed data response.
        return res.status(200).send({
            ...(result.output || {}),
            signature: {
                ...signature,
                signatureValue: rsa.generateSignature({
                    __signed__: signature.created,
                    ...(result.output[result.payloadKey || 'data'] || {}),
                }),
            },
        });
    } catch (err) {
        // Compose error response object.
        result = {
            error: {
                status: err.httpStatusCode || 500,
                message: err.message || 'Internal Server Error.',
                translator_response: err.translator_response || undefined,
            },
        };

        // Send response.
        return res.status(err.httpStatusCode || 500).send(result);
    }
};
