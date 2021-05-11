'use strict';
/**
 * Module dependencies.
 */
const router = require('express').Router();

/**
 * Download link plugin.
 *
 * Generates url for downloading the output data.
 */

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
 * @return
 *   The translator data.
 */
const controller = async (req, res) => {
    const data = '';
    try {
        const filename = 'name.ext';
        res.setHeader('Content-type', 'application/octet-stream');
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
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
    router.get('/:topic*?', controller);
    return router;
};

/**
 * Handles link generation.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    // Hand over data objects to transformer.
    try {
        // TODO:
        // 1. Store file to local filesystem or cache.
        // 2. Generate links (with expires fields).
        // 3. Attach links to output objects.
        // 4. Remove files after expiration.
        return output;
    } catch (err) {
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'download-link',
    endpoints,
    output,
};
