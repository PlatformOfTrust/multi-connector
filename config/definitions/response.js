"use strict";
/** Default output definitions. */
const defaultOutput = {
    /** Body */
    contextValue: 'https://standards.oftrust.net/v2/Context/DataProductOutput/Sensor/',
    context: '@context',
    object: 'data',
    /** Payload */
    timestamp: 'timestamp',
    array: 'sensors',
    value: 'value',
    type: '@type',
    data: 'data',
    id: 'id'
};

/**
 * Expose definitions.
 */
module.exports = {
    defaultOutput
};
