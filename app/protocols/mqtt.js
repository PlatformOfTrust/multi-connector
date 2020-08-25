"use strict";
/**
 * Module dependencies.
 */
const fs = require('fs');
const mqtt = require('mqtt');
const response = require('../lib/response');
const winston = require('../../logger.js');
const cache = require('../cache');
const _ = require('lodash');

const clients = {};
const plugins = {};

/** Supported parallel plugins */
const supportedPlugins = ['azure-service-bus'];

/**
 * Queries measurements cache.
 *
 * @param {Object} config
 * @param {Array} pathArray
 *   Resource path, which will be included to the resource url.
 * @return {Array}
 */
const getData = async (config, pathArray) => {
    let options;
    const items = [];

    /** Data fetching. */
    try {
        // Initialize options.
        options = {
            id: config.generalConfig.hardwareId.dataObjectProperty
        };

        // Execute request plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (!!config.plugins[i].request) {
                options = await config.plugins[i].request(config, options);
            }
        }

        // Retrieve latest measurements from cache.
        const result = Object.values(cache.getDoc('measurements', config.productCode) || {});
        for (let p = 0; p < pathArray.length; p++) {
            // Find measurement by id.
            const measurement = result.find(i => i[options.id] === pathArray[p]);
            if (measurement) items.push(await response.handleData(config, pathArray[p], p, measurement));
        }
    } catch (err) {
        winston.log('error', err.message);

        // Execute onerror plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (!!config.plugins[i].onerror) {
                return await config.plugins[i].onerror(config, err);
            }
        }
    }

    return items;
};

/**
 * Connects to MQTT broker.
 *
 * @param {Object} config
 * @param {String} productCode
 */
const connect = async (config, productCode) => {
    try {
        const url = config.static.url;
        const topic = config.static.topic;
        const key = cache.getDoc('resources', config.static.key);
        const cert = cache.getDoc('resources', config.static.cert);

        // Connect to broker.
        clients[productCode] = mqtt.connect(url, {
            key: Buffer.from(key),
            cert: Buffer.from(cert),
        });

        // Subscribe to defined topic on connect.
        clients[productCode].on('connect', () => {
            clients[productCode].subscribe(topic);
            winston.log('info', productCode + ' subscribed to topic ' + topic + '.');
        });

        // Store received measurements to cache on receive.
        clients[productCode].on('message', async (topic, message) => {
            try {
                const result = cache.getDoc('measurements', productCode) || {};
                result[topic] = JSON.parse(message.toString());
                cache.setDoc('measurements', productCode, result);
            } catch (err) {
                winston.log('error', err.message);
            }

            // Handle data and stream.
            try {
                const template = cache.getDoc('templates', config.template);
                const streamPlugins = template.plugins.filter(p => supportedPlugins.includes(p));
                if (streamPlugins.length > 0) {
                    // Execute stream plugin function.
                    for (let i = 0; i < streamPlugins.length; i++) {
                        // Require plugin, if not yet available.
                        if (!Object.keys(plugins).includes(streamPlugins[i])) {
                            plugins[streamPlugins[i]] = require('../.' + './config/plugins/' + '/' + streamPlugins[i] + '.js');
                        }
                        // Check that plugin has stream method.
                        if (!!plugins[streamPlugins[i]].stream) {
                            try {
                                // Resolve id.
                                const path = template.generalConfig.hardwareId.dataObjectProperty;
                                const id = JSON.parse(message.toString())[path];
                                // Compose plugin config, which has plugin specific options.
                                const pluginConfig = (config.plugins ? config.plugins[streamPlugins[i]] || {} : {});
                                // Stream data.
                                plugins[streamPlugins[i]].stream(
                                    {
                                        ...template,
                                        ...pluginConfig
                                    },
                                    _.flatten(await getData(
                                        {
                                            ...template,
                                            ...pluginConfig,
                                            plugins: [],
                                            productCode: productCode,
                                        },
                                        [id])
                                    )
                                );
                            } catch (err) {
                                winston.log('error', err.message);
                            }
                        }
                    }
                }
            } catch (err) {
                winston.log('error', err.message);
            }
        });
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Expose library functions.
 */
module.exports = {
    connect,
    getData
};
