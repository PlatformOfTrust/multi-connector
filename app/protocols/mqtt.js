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
 * Queries messages cache.
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

        // Retrieve latest messages from cache.
        const result = cache.getDoc('messages', config.productCode) || {};
        for (let p = 0; p < pathArray.length; p++) {
            if (Object.hasOwnProperty.call(result, pathArray[p])) {
                /** Id and topic are linked. */
                const message = Object.values(result);
                if (message) items.push(await response.handleData(config, pathArray[p], p, message));
            } else {
                /** Messages have to be find by id. */
                const message = Object.values(result).find(i => i[options.id] === pathArray[p]);
                if (message) items.push(await response.handleData(config, pathArray[p], p, message));
            }
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
        let topic = config.static.topic;
        let options = {};

        if (Object.hasOwnProperty.call(config.static, 'key')) {
            options.key = cache.getDoc('resources', config.static.key);
        }

        if (Object.hasOwnProperty.call(config.static, 'cert')) {
            options.cert = cache.getDoc('resources', config.static.cert);
        }

        // Connect to broker.
        clients[productCode] = mqtt.connect(url, options);

        // Subscribe to defined topic on connect.
        clients[productCode].on('connect', () => {
            /** Topic can be a string or an array of strings. */
            clients[productCode].subscribe(topic);
            winston.log('info', productCode + ' subscribed to topic ' + topic + '.');
        });

        // Store received messages to cache on receive.
        clients[productCode].on('message', async (topic, message) => {
            try {
                const result = cache.getDoc('messages', productCode) || {};
                result[topic] = JSON.parse(message.toString());
                cache.setDoc('messages', productCode, result);
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
