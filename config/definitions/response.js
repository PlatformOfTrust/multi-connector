"use strict";
/**
 * Response definitions.
 */
const definitions = {
    CONTEXT: '@context',
    TIMESTAMP: 'timestamp',
    DATA: 'measurements',
    VALUE: 'value',
    TYPE: '@type',
    ID: 'id',
};

/** Default output definitions. */
const defaultOutput = {
    context: 'https://standards-ontotest.oftrust.net/v2/Context/DataProductParameters/Sensor/',
    object: 'data',
    array: 'sensors'
};

/**
 * Expose definitions.
 */
module.exports = {
    ...definitions,
    defaultOutput
};
