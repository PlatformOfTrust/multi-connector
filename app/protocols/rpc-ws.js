'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const response = require('../lib/response');
const winston = require('../../logger.js');
const io = require('rpc-websockets').Client;
const {wait} = require('../lib/utils');
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
            const message = Object.values(result).flat().find(i => i[options.id] === pathArray[p]);
            if (message) items.push(await response.handleData(config, pathArray[p], p, message));
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
 * Handles data.
 *
 * @param {Object} config
 * @param {String} productCode
 * @param {String} topic
 * @param {Object} message
 */
const handleData = async (config, productCode, topic, message) => {
    let template = cache.getDoc('templates', config.template);

    // Place values defined in config to template.
    template = connector.replacePlaceholders(config, template, config.static);
    template.schema = config.schema;
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
        const options = {rejectUnauthorized: false};

        if (Object.hasOwnProperty.call(config.static, 'username')) {
            options.username = config.static.username;
        }

        if (Object.hasOwnProperty.call(config.static, 'password')) {
            options.password = config.static.password;
        }

        if (Object.hasOwnProperty.call(config.static, 'event')) {
            options.event = config.static.event;
        }

        const topic = options.event || 'message';

        // Close previous connection.
        if (Object.hasOwnProperty.call(sockets, productCode)) {
            winston.log('info', `${productCode}: Closing existing connection.`);
            try {
                if (typeof (sockets[productCode] || {}).close === 'function' && sockets[productCode].socket !== undefined) {
                    sockets[productCode].close();
                }
                await wait(2000);
                delete sockets[productCode];
            } catch (err) {
                delete sockets[productCode];
                winston.log('error', err.message);
            }
        }

        winston.log('info', `${productCode}: Initialize websocket connection.`);
        sockets[productCode] = new io(url, options);
        sockets[productCode].on('open', async () => {
            winston.log('info', `${productCode}: Websocket connection open.`);
            await sockets[productCode].call('LogIn', options).then(async () => {
                winston.log('info', `${productCode}: JSON-RPC logged in.`);
                /*
                    // Get gateway id.
                    await sockets[productCode].call('Read', {}).then(function (result) {
                        return sockets[productCode].call('Read', {
                            id: result.id,
                        });
                    }).then(gateway => {
                        const childAreas = gateway.children.filter(child => child.type === 'Area');
                        childAreas.forEach(area => {
                            sockets[productCode].call('Read', {
                                id: area.id,
                            }).then(async (message) => {
                                // console.log('Read', message.occupancy);
                                await handleData(config, productCode, topic, message);

                                const childChannels = area.children.filter(child => child.type === 'Channel');
                                childChannels.forEach(channel => {
                                    sockets[productCode].call('Read', {
                                        id: channel.id,
                                    }).then(function (result) {
                                        // console.log('result', result);
                                    }).catch(function (error) {
                                        console.log('error', error);
                                    });
                                });
                            }).catch(function (error) {
                                console.log('error', error);
                            });
                        });
                    }).catch(function (error) {
                        console.log('error', error);
                    });
                    */

                (Array.isArray(topic) ? topic : [topic]).forEach(t => {
                    winston.log('info', productCode + ': Subscribed to event ' + t + '.');
                    sockets[productCode].on(t, async (message) => {
                        await handleData(config, productCode, t, message);
                    });
                });
            }).catch((err) => {
                // Remove failed connection.
                delete sockets[productCode];
                winston.log('error', err.message);
            });
        });
        sockets[productCode].on('close', () => {
            winston.log('info', `${productCode}: Websocket connection closed.`);
        });
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
