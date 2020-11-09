'use strict';
/**
 * Module dependencies.
 */
const response = require('../lib/response');
const winston = require('../../logger.js');

/**
 * Initiates data requests, but relies on plugin to fetch the data.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Array}
 */
const getData = async (config, pathArray) => {
    const items = [];

    /** Data fetching. */
    try {
        // Initialize options.
        let options = {};

        // Execute request plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (config.plugins[i].request) {
                options = await config.plugins[i].request(config, options);
            }
        }

        for (let p = 0; p < pathArray.length; p++) {
            const item = await response.handleData(config, pathArray[p], p, pathArray[p]);
            if (item) items.push(item);
        }
    } catch (err) {
        winston.log('error', err.message);

        // Execute onerror plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (config.plugins[i].onerror) {
                return await config.plugins[i].onerror(config, err);
            }
        }
    }

    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
};
