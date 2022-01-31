'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Rakennustieto.
 */

/** Property to path parameter mapping. */
const map = {
    ItemGTINCode: 'gtin',
    ItemRTNumber: 'itemNumber',
    SupplierVATNumber: 'supplierVAT',
    ItemTalo2000Classes: 'talo2000',
};

// Source mapping.
const schema = require('../schemas/product-catalog_rakennustieto.json');

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
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, id, data) {
    let result = {};
    try {
        for (let j = 0; j < data.length; j++) {
            const value = data[j][config.output.value];
            result = transformer.transform(value, schema.properties.data);
        }
        return result;
    } catch (err) {
        return result;
    }
};

/**
 * Transforms output to Platform of Trust context schema.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    // Initialize harmonized output.
    const result = {
        [config.output.context]: config.output.contextValue,
        [config.output.object]: {
            [config.output.array]: [],
        },
    };

    // Hand over data objects to transformer.
    try {
        const array = output.data[config.output.array];
        for (let i = 0; i < array.length; i++) {
            result[config.output.object][config.output.array].push(
                handleData(
                    config,
                    array[i][config.output.id],
                    array[i][config.output.data],
                ));
        }
        if (result[config.output.object][config.output.array].length === 1) {
            result[config.output.object] =
                result[config.output.object][config.output.array][0];
        } else {
            result[config.output.object][config.output.array] =
                result[config.output.object][config.output.array].map((o => {
                    return Object.values(o);
                })).flat(2);
        }
        return result;
    } catch (err) {
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'rakennustieto',
    parameters,
    output,
    id,
};
