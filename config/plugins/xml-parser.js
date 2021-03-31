'use strict';
/**
 * Module dependencies.
 */
const parser = require('fast-xml-parser');

/**
 * XML response parsing.
 */

/**
 * Removes dots from xml response < > tags.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        response = parser.parse(response.body.toString().replace(/\.(?=[^<>]*>)/g, ''));
        return response;
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'xml-parser',
    response,
};
