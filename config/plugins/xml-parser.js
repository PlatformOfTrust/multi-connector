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
        // Try to parse options from the config.
        let options;
        try {
            options = config.plugins.find(p => p.name === 'xml-parser').options;
        } catch (err) {
            options = {};
        }
        response = parser.parse(response.body.toString().replace(/(?=[^<>]*>)/g, ''), options);
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
