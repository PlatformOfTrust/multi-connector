'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Filtering plugin.
 */

/**
 * Filters response object by id.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        const ids = (_.get(config, 'parameters.ids') || []).map(object => object.id);
        // Skip filtering in case ids array is empty.
        if (ids.length === 0) { return response; }
        const idPath = 'generalConfig.hardwareId.dataObjectProperty';
        const idKey = _.get(config, idPath);
        config['dataObjects'].forEach((path) => {
            // Filter objects by id.
            response[path] = response[path].filter(object => ids.includes(_.get(object, idKey)));
        });
        return response;
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'filter-by-id',
    response,
};
