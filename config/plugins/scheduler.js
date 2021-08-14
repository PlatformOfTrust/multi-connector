'use strict';
/**
 * Module dependencies.
 */
const connector = require('../../app/lib/connector');

/**
 * Scheduler.
 */

const DEFAULT_INTERVAL = 10000;
const schedules = {};

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
        return await connector.getData(triggeredReq);
    } catch (e) {
        console.log(e.message);
    }
};

/**
 * Streams received broker response data.
 *
 * @param {Object} config
 * @param {Object} scheduler
 * @param {Object} response
 */
const stream = async (config, scheduler, response) => {
    try {
        if (Object.hasOwnProperty.call(scheduler, 'streamer')) {
            if (Object.hasOwnProperty.call(scheduler.streamer, 'url')) {
                let template = {
                    config: {...config, plugins: {streamer: scheduler.streamer}},
                    plugins: ['streamer'],
                    output: {},
                };
                template = await connector.resolvePlugins(template);
                await template.plugins.find(p => p.name === 'streamer').stream(template, response.output);
            }
        }
    } catch (e) {
        console.log(e.message);
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
        if (Object.hasOwnProperty.call(parameters, 'scheduler')
            && Object.hasOwnProperty.call(config, 'productCode')) {
            if (Object.hasOwnProperty.call(parameters.scheduler, 'interval')) {
                // Remove previous schedule.
                if (Object.hasOwnProperty.call(schedules, config.productCode)) {
                    clearInterval(schedules[config.productCode]);
                }
                // Set new schedule if provided interval is valid.
                if (Number.isInteger(parameters.scheduler.interval)) {
                    schedules[config.productCode] = setInterval(async (scheduler) => {
                        // Detect mode from scheduler options.
                        if (scheduler.mode === 'latest') {
                            delete parameters.start;
                            delete parameters.end;
                        }
                        // Trigger broker request.
                        const result = await brokerRequest(config.productCode, parameters);
                        // Stream result.
                        await stream(config, scheduler, result);
                    }, Math.max(DEFAULT_INTERVAL, parameters.scheduler.interval), parameters.scheduler);
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
