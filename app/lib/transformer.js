"use strict";
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Transformer library.
 *
 * Handles output transformation.
 */

/**
 * Transforms data object by given properties schema.
 *
 * @param {Object} source
 * @param {Object} schema
 * @return
 */
const transform = function (source, schema) {
    let value = undefined;
    try {
        switch (schema.type) {
            case 'object':
                value = {};
                Object.entries(schema.properties || {})
                    .forEach(entry => {
                        const result = transform(source, entry[1]);
                        if (result !== undefined) value[entry[0]] = result;
                    });
                if (_.isEmpty(value)) value = undefined;
                break;
            case 'array':
                value = [];
                if (Object.hasOwnProperty.call(schema, 'source')) {
                    let array = _.get(source, schema.source);
                    if (array === undefined) return;
                    if (!Array.isArray(array)) array = [array];
                    array.forEach(element => {
                        if (!Object.hasOwnProperty.call(schema, 'items')) return;
                        if (!Object.hasOwnProperty.call(schema.items, 'anyOf')) return;
                        if (!Array.isArray(schema.items.anyOf)) return;
                        schema.items.anyOf.forEach(item => value.push(transform(element, item)));
                    })
                }
                break;
            case 'string':
                if (Object.hasOwnProperty.call(schema, 'source')) {
                    if (schema.source) value = _.get(source, schema.source);
                }
                break;
        }
        return value;
    } catch (err) {
        return value;
    }
};

/**
 * Expose library functions.
 */
module.exports = {
    transform
};
