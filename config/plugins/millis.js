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
 * @param {Boolean} seconds
 *   Whether to return the value in seconds.
 * @return {Object}
 */
const toMillis = function (config, path, target, seconds = false) {
    const key = _.get(config, path);
    if (key) {
        target = target.map((q) => {
            if (Object.keys(q).includes(key)) {
                /** Conversion to millis. */
                q[key] = seconds ? new Date(q[key]).getTime().toString().substring(0, 10) : new Date(q[key]).getTime();
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
        const plugin = (config.plugins || []).find(p => _.get(p, 'name') === 'millis') || {};
        // Convert start and end values in the query object array.
        options.query = toMillis(config, 'generalConfig.query.start', options.query, (plugin.options || {}).format === 'seconds');
        options.query = toMillis(config, 'generalConfig.query.end', options.query, (plugin.options || {}).format === 'seconds');
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
