'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Office 365.
 */

/**
 * Filters received documents by id.
 *
 * @param {Object} config
 * @param {Object/String} res
 * @return {Object}
 */
const response = async (config, res) => {
    try {
        if (Object.hasOwnProperty.call(config.parameters, 'ids')) {
            if (Array.isArray(config.parameters.ids)) {
                const ids = config.parameters.ids.map(o => o.id);
                const dataObjectKey = config.dataObjects[0];
                const idPath = Object.values(config.generalConfig.hardwareId)[0];
                res[dataObjectKey] = res[dataObjectKey].filter(o => ids.includes(_.get(o, idPath)));
            }
        }
        return res;
    } catch (e) {
        return res;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'office365',
    response,
};
