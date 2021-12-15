'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const {replacer} = require('./utils');

/**
 * Transformer library.
 *
 * Handles output transformation.
 */

/**
 * Extracts the most inner placeholder.
 *
 * @param {String} placeholder
 * @return {String}
 */
const extractPlaceholder = (placeholder) => {
    const parts = placeholder.split('${');
    return '${' + parts[parts.length - 1];
};

/**
 * Detects and handles placeholders.
 *
 * @param {Object} source
 * @param {Object} value
 * @return
 */
const replacePlaceholders = function (source, value) {
    try {
        const placeholders = value.match(/\${(.*?)}/g) || [];
        for (let i = 0; i < placeholders.length; i++) {
            try {
                const current = extractPlaceholder(placeholders[i]);
                const path = current.substring(2, current.length - 1);
                const data = _.get(source, path);
                value = replacer(value, path, data);
                // Handle outer placeholders.
                if ((placeholders[i].match(/\${/g) || []).length > 1) {
                    placeholders.push(...value.match(/\${(.*?)}/g) || []);
                }
            } catch (err) {
                console.log(err.message);
            }
        }
    } catch (err) {
        console.log(err.message);
    }
    return value;
};

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
        const types = Array.isArray(schema.type) ? schema.type : [schema.type];
        types.forEach(type => {
            switch (type) {
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
                    if (Object.hasOwnProperty.call(schema, 'value')) {
                        value.push(replacePlaceholders(source, schema.value));
                    } else if (Object.hasOwnProperty.call(schema, 'source')) {
                        let array = schema.source === '' ? source : _.get(source, schema.source);
                        if (array === undefined) return;
                        if (!Array.isArray(array)) array = [array];
                        array.forEach(element => {
                            if (!Object.hasOwnProperty.call(schema, 'items')) return;
                            if (!Object.hasOwnProperty.call(schema.items, 'anyOf')
                                && !Object.hasOwnProperty.call(schema.items, 'properties')) return;
                            if (Object.hasOwnProperty.call(schema.items, 'anyOf')
                                && !Array.isArray(schema.items.anyOf)) return;
                            if (!Object.hasOwnProperty.call(schema.items, 'anyOf')) {
                                value.push(transform(element, schema.items));
                            } else {
                                schema.items.anyOf.forEach(item => value.push(transform(element, item)));
                            }
                        });
                    }
                    break;
                case 'string':
                case 'boolean':
                case 'integer':
                case 'number':
                    if (Object.hasOwnProperty.call(schema, 'value')) {
                        value = replacePlaceholders(source, schema.value);
                    } else if (Object.hasOwnProperty.call(schema, 'source')) {
                        if (schema.source) value = schema.source === '' ? source : _.get(source, schema.source, schema.default);
                    }
                    break;
            }
        });
        return value;
    } catch (err) {
        return value;
    }
};

/**
 * Expose library functions.
 */
module.exports = {
    transform,
};
