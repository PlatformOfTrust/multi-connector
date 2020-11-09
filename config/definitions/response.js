'use strict';
/**
 * Connector response definitions.
 */

/** List of default output keys and values. */
const defaultOutput = {
    /** Body */
    contextValue: 'https://standards.oftrust.net/v2/Context/DataProductOutput/Sensor/',
    context: '@context',
    object: 'data',
    /** Payload */
    timestamp: 'timestamp',
    data: 'measurements',
    array: 'sensors',
    value: 'value',
    type: '@type',
    id: 'id',
};

/**
 * Expose definitions.
 */
module.exports = {
    defaultOutput,
};
