'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Granlund metrix timestamp handler.
 */

/**
 * Removes timezone from timestamp.
 *
 * @param {Object} config
 *   Source of key name.
 * @param {Object} path
 *   Path to key name of the target key.
 * @param {Object} target
 *   Target object array.
 * @return {Object}
 */
const removeTimezone = function (config, path, target) {
    const key = _.get(config, path);
    if (key) {
        target = target.map((q) => {
            if (Object.keys(q).includes(key)) {
                q[key] = q[key].split('Z')[0].split('.')[0];
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
        options.query = removeTimezone(config, 'generalConfig.query.start', options.query);
        options.query = removeTimezone(config, 'generalConfig.query.end', options.query);
    } catch (err) {
        console.log(err.message);
    }
    return options;
};

/**
 * Attaches id and name to measurements.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        if (config.mode === 'latest') {
            const idKey = _.get(config, 'generalConfig.hardwareId.dataObjectProperty');
            const nameKey = _.get(config, 'generalConfig.sourceName.dataObjectProperty');
            config['dataObjects'].forEach((path) => {
                if (_.get(response, path)) {
                    _.set(response, path, (_.get(response, path) || [])
                        .map(data => ({
                            ...data,
                            [idKey]: _.get(response, idKey) + '',
                            [nameKey]: _.get(response, nameKey),
                        })));
                }
            });
        }
        return response;
    } catch (e) {
        console.log(e);
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'granlund-metrix',
    request,
    response,
};
