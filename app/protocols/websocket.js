'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const response = require('../lib/response');
const winston = require('../../logger.js');
const io = require('socket.io-client');
const cache = require('../cache');
const _ = require('lodash');

const sockets = {};

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
            /** Multi level wildcard implementation */
            const root = pathArray[p].split('#')[0];
            const matchingKeys = Object.keys(result).filter(key => key.substring(0, root.length) === root);

            if (matchingKeys.length > 0) {
                /** Id and topic are linked. */
                const messages = Object.entries(result).filter(entry => matchingKeys.includes(entry[0]));
                for (let x = 0; x < messages.length; x++) {
                    const id = messages[x][0];
                    let message = messages[x][1];
                    if (Array.isArray(message)) {
                        message = message.map(m => {
                            return _.isObject(m) ? {
                                [options.id]: id,
                                ...m,
                            } : {
                                [options.id]: id,
                                message: m,
                            };
                        });
                    } else {
                        message = _.isObject(message) ? {
                            [options.id]: id,
                            ...message,
                        } : {
                            [options.id]: id,
                            message,
                        };
                    }
                    if (message) items.push(await response.handleData(config, id, p, message));
                }
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
 * Generates random UUIDv4.
 *
 * @return {String}
 */
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
        const options = {};
        let query = {};

        if (Object.hasOwnProperty.call(config.static, 'event')) {
            options.event = config.static.event;
        }

        if (Object.hasOwnProperty.call(config.static, 'query')) {
            query = config.static.query;
        }

        query.client_id = uuidv4();

        const topic = options.event || 'message';

        if (!Object.hasOwnProperty.call(sockets, productCode)) {
            sockets[productCode] = io(url, {
                query,
            });

            sockets[productCode].on('connect', function () {
                winston.log('info', productCode + ' subscribed to event ' + topic + '.');

                // Store received messages to cache on receive.
                sockets[productCode].on(topic, async (message) => {
                    let template = cache.getDoc('templates', config.template);
                    try {
                        const result = cache.getDoc('messages', productCode) || {};
                        // Replace resource path.
                        const path = template.generalConfig.hardwareId.dataObjectProperty;
                        let id;
                        if (Object.hasOwnProperty.call(message, path)) {
                            id = message[path];
                        } else {
                            id = topic;
                        }
                        result[id] = message;
                        cache.setDoc('messages', productCode, result);
                    } catch (err) {
                        winston.log('error', err.message);
                    }

                    // Handle data and stream.
                    try {
                        template = await connector.resolvePlugins(template);
                        if (template.plugins.filter(p => !!p.stream).length > 0) {
                            // Replace resource path.
                            const path = template.generalConfig.hardwareId.dataObjectProperty;
                            let id;
                            if (Object.hasOwnProperty.call(message, path)) {
                                id = message[path];
                            } else {
                                id = topic;
                            }
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
                                    config,
                                },
                                template.plugins[i].stream,
                                );
                            }
                        }
                    } catch (err) {
                        winston.log('error', err.message);
                    }
                });

                sockets[productCode].on('disconnect', function () {
                    winston.log('info', productCode + ' disconnected from websocket event ' + topic + '.');
                });
            });
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Initiates actions required by WebSocket protocol.
 *
 * @param {Object} config
 * @param {String} productCode
 */
const connect = async (config, productCode) => {
    try {
        // Connect to external websocket server.
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
