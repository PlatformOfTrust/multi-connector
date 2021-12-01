'use strict';
/**
 * Module dependencies.
 */
const connector = require('../../app/lib/connector');
const cache = require('../../app/cache');

/**
 * Scheduler.
 */

const DEFAULT_INTERVAL = 10000;
const schedules = {};

/**
 * Initiates broker request.
 *
 * @param {String} productCode
 * @param {String} [mode]
 */
const brokerRequest = async (productCode, mode = 'latest') => {
    try {
        const parameters = cache.getDoc('parameters', productCode);
        if (parameters) {
            // Detect mode from scheduler options.
            if (mode === 'latest') {
                delete parameters.start;
                delete parameters.end;
            }
            const triggeredReq = {
                body: {
                    productCode,
                    timestamp: new Date().toISOString(),
                    parameters,
                },
                connectorUrl: '',
                publicKeyUrl: '',
            };
            return await connector.getData(triggeredReq);
        } else {
            return Promise.resolve(null);
        }
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
                // Store parameters to cache.
                cache.setDoc('parameters', config.productCode, {...parameters, scheduler: undefined});
                // Set new schedule if provided interval is valid.
                if (Number.isInteger(parameters.scheduler.interval)) {
                    schedules[config.productCode] = setInterval(async (scheduler) => {
                        // Trigger broker request.
                        const result = await brokerRequest(config.productCode, scheduler.mode);
                        // Stream result.
                        if (result) await stream(config, scheduler, result);
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
