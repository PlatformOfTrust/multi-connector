'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const schema = require('../schemas/service-request_granlund-manager.json');

/**
 * Grandlund Manager transformer.
 */


/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, id, data) {
    let object = {};
    try {
        const key = Object.keys(schema.properties.data.properties)[0];
        for (let j = 0; j < data.length; j++) {
            let result = {};
            const value = data[j][config.output.value];

            // Transform raw input.
            value.type = 'Case';
            value.statusType = 'Status';
            value.statusCodeType = 'StatusCode';
            value.creatorType = 'Organization';
            value.requestorType = 'Person';
            value.parentObjectType = 'Object';
            value.locationType = 'Location';
            value.locationOrganizationType = 'Organization';

            switch (value.Phase) {
                case 'Defined':
                    value.Phase = 'Defined';
                    break;
                case 'New':
                    value.Phase = 'New';
                    break;
                case 'UnderProgress':
                    value.Phase = 'Ongoing';
                    break;
                case 'Completed':
                    value.Phase = 'Completed';
                    break;
            }

            result = transformer.transform(value, schema.properties.data);

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
    name: 'granlund-manager',
    output,
};
