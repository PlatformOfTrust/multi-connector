'use strict';
/**
 * Module dependencies.
 */
const transformer = require('./transformer');
const cache = require('../cache');

/**
 * Output library.
 *
 * Default output handler.
 */

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object} schema
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, schema, id, data) {
    let object = {};
    try {
        const key = Object.keys(schema.properties.data.properties)[0];
        for (let j = 0; j < data.length; j++) {
            let result = {};
            result = transformer.transform({id, parameters: config.parameters || {}, data: data[j]}, schema.properties.data);

            // Merge all to same result.
            if (Object.hasOwnProperty.call(object, key)) {
                if (!Array.isArray(object[key])) {
                    object[key] = [object[key]];
                }
                if (!Array.isArray(result[key])) {
                    result[key] = [result[key]];
                }
                object[key].push(...result[key]);
            } else {
                object = result;
            }
        }
        if (JSON.stringify(object) === '{}') {
            object = {[key]: []};
        }
        return object;
    } catch (err) {
        return object;
    }
};

/**
 * Handles output data.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Promise}
 */
const handleOutput = async (config, output) => {
    // Detect schema configuration.
    if (!config.schema) {
        return output;
    }

    try {
        const schema = cache.getDoc('schemas', config.schema);
        if (!schema) {
            return output;
        }

        // Initialize harmonized output.
        const result = {
            [config.output.context]: schema['$id'],
            [config.output.object]: {
                [config.output.array]: [],
            },
        };

        // Hand over data objects to transformer.
        const array = output.data[config.output.array];
        for (let i = 0; i < array.length; i++) {
            result[config.output.object][config.output.array].push(
                handleData(
                    config,
                    schema,
                    array[i][config.output.id],
                    array[i][config.output.data],
                ));
        }

        // Convert array with one element to object.
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
 * Expose library functions.
 */
module.exports = {
    handleOutput,
};
