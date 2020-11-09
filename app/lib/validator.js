'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Validator library.
 *
 * Handles request validation.
 */

/**
 * Validates target object by given schema.
 *
 * @param {Object} target
 * @param {Object} schema
 * @return {Object}
 *   Validation object.
 */
const validate = function (target, schema) {
    let result;
    let error;
    const missing = [];
    for (const parameter in schema) {
        if (Object.hasOwnProperty.call(schema, parameter)) {
            if (!_.get(target, parameter)) {
                if (schema[parameter].required) missing.push(parameter);
            }
        }
    }
    if (missing.length > 0) {
        result = false;
        error = Object.assign({}, ...missing.map((p) => {
            return {[p]: ['Missing data for required field.']};
        }));
    }
    return {
        result,
        error,
    };
};

/**
 * Expose library functions.
 */
module.exports = {
    validate,
};
