'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Millis.
 */

/**
 * Converts target value to millis.
 *
 * @param {Object} config
 *   Source of key name.
 * @param {Object} path
 *   Path to key name of the target key.
 * @param {Object} target
 *   Target object array.
 * @return {Object}
 */
const toMillis = function (config, path, target) {
    const key = _.get(config, path);
    if (key) {
        target = target.map((q) => {
            if (Object.keys(q).includes(key)) {
                /** Conversion to millis. */
                q[key] = new Date(q[key]).getTime();
            }
            return q;
        });
    }
    return target;
};

/**
 * Handles start and end query properties.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    try {
        // Convert start and end values in the query object array.
        options.query = toMillis(config, 'generalConfig.query.start', options.query);
        options.query = toMillis(config, 'generalConfig.query.end', options.query);
    } catch (err) {
        console.log(err.message);
    }
    return options;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'millis',
    request,
};
