'use strict';
/**
 * Module dependencies.
 */
const crypto = require('crypto');
const cache = require('../../app/cache');
const router = require('express').Router();

/**
 * Download link plugin.
 *
 * Generates url for downloading the output data.
 */
const PLUGIN_NAME = 'download-link';
const LINK_EXPIRATION_TIME = 5 * 60; // 5 min.

/**
 * Local handler to send error response.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Error} err
 */
const errorResponse = async (req, res, err) => {
    let message;
    try {
        message = JSON.parse(err.message);
    } catch (e) {
        message = err.message;
    }

    // Compose error response object.
    const result = {
        error: {
            status: err.httpStatusCode || 500,
            message: message || 'Internal Server Error.',
            translator_response: err.translator_response || undefined,
        },
    };

    // Send response.
    return res.status(err.httpStatusCode || 500).send(result);
};

/**
 * Endpoint to trigger fetching of new data from CALS.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @return
 *   The translator data.
 */
const controller = async (req, res, next) => {
    try {
        // Validate parameters.
        const id = req.params[0].split('/')[0];
        const filename = req.params[0].split('/')[1];
        if (filename === '' || !filename) {
            /** Missing filename. */
            return next();
        }

        // Fetch file from cache.
        const doc = cache.getDoc('documents', id);
        if (!doc) {
            /** File not found. */
            return next();
        }

        // Validate filename.
        if (doc.name !== filename) {
            /** Bad filename. */
            return next();
        }

        // Send file in response.
        const data = Buffer.from(doc.content, doc.categorizationEncoding || doc.encoding || 'base64');
        res.contentType(doc.categorizationInternetMediaType || doc.mimetype || 'text/plain');
        res.send(data);
    } catch (err) {
        if (!res.finished) {
            return errorResponse(req, res, err);
        }
    }
};

/**
 * Returns plugin HTTP endpoints.
 *
 * @param {Object} passport
 * @return {Object}
 */
const endpoints = function (passport) {
    /** Download endpoint. */
    router.get('/*', controller);
    return router;
};

/**
 * Pick custom ttl.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        // Attempt to use custom ttl.
        template.ttl = Number.parseInt(config.plugins['download-link'].ttl);
    } catch (err) {
        return template;
    }
    return template;
};

/**
 * Handles link generation and document caching.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    const ttl = Number.isInteger(config.ttl) ? config.ttl : LINK_EXPIRATION_TIME;
    try {
        output[config.output.object][config.output.array] = output[config.output.object][config.output.array].map(doc => {
            // Generate random id.
            // 2^160 (256^20) unique output values.
            const id = crypto.randomBytes(20).toString('hex');

            // Save document to cache.
            cache.setDoc('documents', id, doc, ttl);

            // Attach url.
            doc.url = config.authConfig.connectorURL + '/translator/v1/plugins/'+ PLUGIN_NAME + '/' + id + '/' + encodeURI(doc.name);
            doc.expires = new Date(new Date().getTime() + ttl * 1000).toISOString();

            // Remove content from response.
            if (doc.categorizationEncoding === 'base64') {
                delete doc.categorizationEncoding;
                delete doc.content;
            }
            return doc;
        });
        return output;
    } catch (err) {
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: PLUGIN_NAME,
    endpoints,
    template,
    output,
};
