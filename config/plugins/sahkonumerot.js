"use strict";
/**
 * Sahkonumerot.
 */

/** Property to path parameter mapping. */
const map = {
    TT052: 'gtinCode'
};

/**
 * Translates response id to request id.
 *
 * @param {Object} config
 * @param {String/Object} id
 * @return {String/Object}
 */
const id = async (config, id) => {
    let translation;
    try {
        translation = config.parameters.ids[config.index];
        // Reverse translation.
        translation.property = Object.keys(map)[Object.values(map).indexOf(translation.property)];
    } catch (err) {
        return id;
    }
    return translation || id;
};

/**
 * Translates request parameters.
 *
 * @param {Object} config
 * @param {String/Object} parameters
 * @return {String/Object}
 */
const parameters = async (config, parameters) => {
    try {
        // Translate id properties.
        for (let i = 0; i < parameters.ids.length; i++) {
            parameters.ids[i].property = map[parameters.ids[i].property];
        }
        return parameters;
    } catch (err) {
        return parameters;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'sahkonumerot',
    parameters,
    id
};
