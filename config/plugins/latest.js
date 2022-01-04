'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Filtering plugin.
 */

/**
 * Returns compare function.
 *
 * @param {String} key
 * @return {Function}
 */
const sortByDateTimeString = (key) => (a, b) => new Date(a[key]).getTime() - new Date(b[key]).getTime();

/**
 * Filters response latest data objects.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        if (config.mode === 'latest') {
            const ids = (_.get(config, 'parameters.ids') || []).map(object => object.id || object.idLocal);
            const idPath = 'generalConfig.hardwareId.dataObjectProperty';
            const idKey = _.get(config, idPath);
            const timestampPath = 'generalConfig.timestamp.dataObjectProperty';
            const timestampKey = _.get(config, timestampPath);
            config['dataObjects'].forEach((path) => {
                // Filter latest data.
                if (Object.hasOwnProperty.call(response, path)) {
                    response[path] = ids.map(id => response[path]
                        .sort(sortByDateTimeString(timestampKey))
                        .filter(c => c[idKey] === id || ids[config.index] === id).pop()).flat();
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
    name: 'latest',
    response,
};
