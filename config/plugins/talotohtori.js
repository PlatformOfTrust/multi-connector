"use strict";
/**
 * Talotohtori id mapping.
 */

/**
 * Manipulate id.
 *
 * @param {Object} config
 * @param {Object} id
 * @return {Object}
 */
const id = async (config, id) => {
    try {
        const insert = config.parameters.ids[config.index].id
        return insert;
    } catch (e) {
        return id;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'talotohtori',
    id
};
