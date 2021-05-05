'use strict';
/**
 * Module dependencies.
 */
const connector = require('../../app/lib/connector');

/**
 * Scheduler.
 */

const DEFAULT_INTERVAL = 10000;
let schedule;

/**
 * Initiates broker request.
 *
 * @param {Object} productCode
 * @param {Object} parameters
 */
const brokerRequest = async (productCode, parameters) => {
    try {
        delete parameters.scheduler;
        const triggeredReq = {
            body: {
                productCode,
                timestamp: new Date().toISOString(),
                parameters: {...parameters},
            },
            protocol: 'http',
            get: function () {
                return '';
            },
        };
        await connector.getData(triggeredReq);
    } catch (e) {
    }
};

/**
 * Inspects broker request for parameters defining a schedule.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'scheduler')) {
            if (Object.hasOwnProperty.call(parameters.scheduler, 'interval')) {
                // Remove previous schedule.
                clearInterval(schedule);
                // Set new schedule if provided interval is valid.
                if (Number.isInteger(parameters.scheduler.interval)) {
                    schedule = setInterval(() => {
                        brokerRequest(config.productCode, parameters);
                    }, Math.max(DEFAULT_INTERVAL, parameters.scheduler.interval));
                }
            }
        }
    } catch (e) {
        console.log(e.message);
    }
    return parameters;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'scheduler',
    parameters,
};
