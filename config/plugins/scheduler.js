'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const cron = require('node-cron');
const cache = require('../../app/cache');
const streamer = require('./streamer');
const winston = require('../../logger.js');
const connector = require('../../app/lib/connector');

/**
 * Scheduler.
 */

// Cron tasks.
const tasks = {};
const schedules = {};
const DEFAULT_TIMEZONE = 'Europe/Helsinki';
const DEFAULT_INTERVAL = 10000;

/**
 * Initiates broker request.
 *
 * @param {String} productCode
 * @param {String} [mode]
 * @param {Object} [options]
 * @return {Object}
 */
const brokerRequest = async (productCode, mode = 'latest', options) => {
    try {
        const productCodes = Array.isArray(productCode) ? productCode : [productCode];
        const result = {};
        for (let i = 0; i < productCodes.length; i++) {
            const parameters = cache.getDoc('parameters', options.id || productCodes[i]);
            if (parameters) {
                // Detect mode from scheduler options.
                if (mode === 'latest') {
                    delete parameters.start;
                    delete parameters.end;
                }
                const triggeredReq = {
                    body: {
                        productCode: productCodes[i],
                        timestamp: new Date().toISOString(),
                        parameters,
                    },
                    connectorUrl: '',
                    publicKeyUrl: '',
                };
                result[productCodes[i]] = await connector.getData(triggeredReq);
            } else {
                result[productCodes[i]] = null;
            }
        }
        return result;
    } catch (e) {
        winston.log('error', e.message);
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
                const template = {
                    config: {...config, plugins: {streamer: scheduler.streamer}},
                    plugins: [streamer],
                    output: {},
                };
                await template.plugins.find(p => p.name === 'streamer').stream(template, response.output);
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Starts a cron task by product code.
 *
 * @param {String} id
 * @param {Object} config
 * @param {Object} parameters
 */
const startTask = (id, config, parameters) => {
    try {
        const callback = async (scheduler) => {
            let result = null;
            try {
                if (Object.hasOwnProperty.call(config, 'productCode')) {
                    // Trigger broker request.
                    result = await brokerRequest(config.productCode, scheduler.mode, {
                        id,
                        clientSecret: scheduler.clientSecret,
                        appAccessToken: scheduler.appAccessToken,
                    });
                }
                if (Object.hasOwnProperty.call(scheduler, 'callback')) {
                    // Execute callback.
                    return scheduler.callback(config, scheduler, result);
                } else if (_.isObject(result)) {
                    // Stream result.
                    for (let i = 0; i < Object.keys(result).length; i++) {
                        if (result[Object.keys(result)[i]]) {
                            await stream(config, scheduler, Object.values(result)[i]);
                        }
                    }
                }
            } catch (err) {
                winston.log('error', err.message);
            }
        };
        if (cron.validate(parameters.scheduler.schedule) && !parameters.scheduler.interval) {
            const schedule = parameters.scheduler.schedule;
            const timezone = parameters.scheduler.timezone || DEFAULT_TIMEZONE;
            winston.log('info', `Start a job with id ${id} and schedule ${schedule} at ${timezone} timezone`);
            tasks[id] = cron.schedule(schedule, () => callback(parameters.scheduler), {
                scheduled: true,
                timezone,
            });
        } else {
            winston.log('info', `Start a job with id ${id} and interval ${parameters.scheduler.interval}`);
            schedules[id] = setInterval(callback, Math.max(DEFAULT_INTERVAL, parameters.scheduler.interval), parameters.scheduler);
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Destroys a cron task by product code.
 *
 * @param {String} productCode
 */
const removeTask = (productCode) => {
    try {
        if (Object.hasOwnProperty.call(tasks, productCode)) {
            if (typeof tasks[productCode].stop === 'function') {
                winston.log('info', `Stop a job with id ${productCode}`);
                tasks[productCode].stop();
            }
            delete tasks[productCode];
        }
        if (Object.hasOwnProperty.call(schedules, productCode)) {
            winston.log('info', `Stop a job with id ${productCode}`);
            clearInterval(schedules[productCode]);
            delete schedules[productCode];
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Inspects broker request for parameters defining a schedule.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'scheduler') &&
            (Object.hasOwnProperty.call(config, 'productCode') || Object.hasOwnProperty.call(config, 'id'))) {
            if (Object.hasOwnProperty.call(parameters.scheduler, 'interval')) {
                let id = config.productCode;
                // Set custom id.
                if (Object.hasOwnProperty.call(config, 'id')) {
                    id = config.id;
                }
                // Remove previous schedule.
                removeTask(id);
                // Store parameters to cache.
                cache.setDoc('parameters', id, {...parameters, scheduler: undefined}, 0);
                // Set new schedule if provided interval is valid.
                if (Number.isInteger(parameters.scheduler.interval) || typeof parameters.scheduler.schedule === 'string') {
                    startTask(id, config, parameters);
                }
            }
        }
    } catch (err) {
        winston.log('error', err.message);
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
