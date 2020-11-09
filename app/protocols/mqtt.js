'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const response = require('../lib/response');
const winston = require('../../logger.js');
const cache = require('../cache');
const mqtt = require('mqtt');
const _ = require('lodash');
const fs = require('fs');

let port = 8881;
const brokers = {};
const clients = {};

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
            id: config.generalConfig.hardwareId.dataObjectProperty,
        };

        // Execute request plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (config.plugins[i].request) {
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
                const message = Object.values(result).flat().find(i => i[options.id] === pathArray[p]);
                if (message) items.push(await response.handleData(config, pathArray[p], p, message));
            }
        }

    } catch (err) {
        winston.log('error', err.message);

        // Execute onerror plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (config.plugins[i].onerror) {
                return await config.plugins[i].onerror(config, err);
            }
        }
    }

    return items;
};

/**
 * Fetches data and passes it to the callback.
 *
 * @param {Object} template
 * @param {Function} callback
 */
const composeDataObject = async (template, callback) => {
    try {
        const result = await connector.composeOutput(template);
        await callback(template, _.flatten([result.output]));
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Connects to broker and listens for updates.
 *
 * @param {Object} config
 * @param {String} productCode
 */
const callback = async (config, productCode) => {
    try {
        const url = config.static.url;
        const topic = config.static.topic;
        const options = {};

        if (Object.hasOwnProperty.call(config.static, 'key')) {
            options.key = cache.getDoc('resources', config.static.key);
        }

        if (Object.hasOwnProperty.call(config.static, 'cert')) {
            options.cert = cache.getDoc('resources', config.static.cert);
        }

        if (Object.hasOwnProperty.call(config.static, 'username')) {
            options.username = config.static.username;
        }

        if (Object.hasOwnProperty.call(config.static, 'password')) {
            options.password = config.static.password;
        }

        // Connect to broker.
        clients[productCode] = mqtt.connect(url, options);

        // Subscribe to defined topic/-s on connect.
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
                let template = cache.getDoc('templates', config.template);
                template = await connector.resolvePlugins(template);

                if (template.plugins.filter(p => !!p.stream).length > 0) {
                    // Replace resource path.
                    const path = template.generalConfig.hardwareId.dataObjectProperty;
                    const id = JSON.parse(message.toString())[path];
                    template.authConfig.path = [id];
                }

                // Execute stream plugin function.
                for (let i = 0; i < template.plugins.length; i++) {
                    if (template.plugins[i].stream) {
                        // Compose plugin config, which has plugin specific options.
                        const pluginConfig = (config.plugins ? config.plugins[template.plugins[i].name] || {} : {});
                        await composeDataObject({
                            ...template,
                            ...pluginConfig,
                            productCode,
                        },
                        template.plugins[i].stream,
                        );
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
 * Initiates actions required by MQTT protocol.
 *
 * @param {Object} config
 * @param {String} productCode
 */
const connect = async (config, productCode) => {
    try {
        // Check for MQTT broker plugin.
        if (Object.hasOwnProperty.call(config, 'plugins')) {
            if (Object.hasOwnProperty.call(config.plugins, 'mqtt-server')) {
                // Reserve port.
                const reservedPort = port;
                port++;
                // Start local broker and pass client connection as a callback.
                brokers[productCode] = require('../.' + './config/plugins' + '/' + 'mqtt-broker' + '.js').connect(config, {
                    ...config.plugins['mqtt-server'],
                    productCode,
                    port: reservedPort,
                }, callback);
                return;
            }
        }
        // Connect to external broker.
        return callback(config, productCode);
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Expose library functions.
 */
module.exports = {
    connect,
    getData,
};
