'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const moment = require('moment');
const rsa = require('../lib/rsa');
const connector = require('../lib/connector');
const winston = require('../../logger.js');

/**
 * Translator controller.
 *
 * Handles fetching and returning of the data.
 */

/** Import platform of trust request definitions. */
const {
    PRODUCT_CODE,
} = require('../../config/definitions/request');

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

        // Log successful data fetch.
        winston.log('info', [
            200,
            req.originalUrl,
            'Handled broker request successfully',
        ].join(' | '));

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
                productCode: _.get(req.body, PRODUCT_CODE) || null,
                appId: (req.user || {})['@id'] || null,
                translator_response: err.translator_response || undefined,
            },
        };

        // Compose error message.
        const message = [
            err.httpStatusCode || err.statusCode || 500,
            req.originalUrl,
            `productCode=${result.error.productCode}, appId=${result.error.appId}`,
            JSON.stringify(result),
        ].join(' | ');

        // Log error.
        winston.log('error', message);

        // Send response.
        return res.status(err.httpStatusCode || 500).send(result);
    }
};
