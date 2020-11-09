'use strict';
/**
 * Broker request definitions.
 */

/** List of definitions. */
const definitions = {
    /** Header */
    SIGNATURE: 'x-pot-signature',
    APP_TOKEN: 'x-app-token',
    USER_TOKEN: 'x-user-token',
    /** Body */
    PRODUCT_CODE: 'productCode',
    TIMESTAMP: 'timestamp',
    PARAMETERS: 'parameters',
    IDS: 'parameters.ids',
    START: 'parameters.startTime',
    END: 'parameters.endTime',
    DATA_TYPES:  'parameters.dataTypes',
};

/** List of supported headers, and if they're required or not. */
const supportedHeaders = {
    [definitions.SIGNATURE]: {
        required: true,
    },
    [definitions.APP_TOKEN]: {
        required: true,
    },
    [definitions.USER_TOKEN]: {
        required: false,
    },
};

/** List of supported parameters, and if they're required or not. */
const supportedParameters = {
    [definitions.PRODUCT_CODE]: {
        required: true,
    },
    [definitions.TIMESTAMP]: {
        required: true,
    },
    [definitions.PARAMETERS]: {
        required: true,
    },
    [definitions.IDS]: {
        required: false,
    },
    [definitions.START]: {
        required: false,
    },
    [definitions.END]: {
        required: false,
    },
    [definitions.DATA_TYPES]: {
        required: false,
    },
};

/**
 * Expose definitions.
 */
module.exports = {
    ...definitions,
    supportedHeaders,
    supportedParameters,
};
