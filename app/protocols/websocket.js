'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const response = require('../lib/response');
const oauth2 = require('../../config/plugins/oauth2');
const winston = require('../../logger.js');
const WebSocket  = require('ws');
const {wait} = require('../lib/utils');
const cache = require('../cache');
const _ = require('lodash');

const sockets = {};
const messages = {};

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
 * Caches data.
 *
 * @param {Object} productCode
 * @param {Object} sessionId
 * @param {Object} data
 */
const cacheMessage = (productCode, sessionId, data) => {
    if (!Object.hasOwnProperty.call(messages, productCode)) {
        messages[productCode] = {};
    }
    messages[productCode][sessionId] = data;
    setTimeout(() => {
        delete messages[productCode][sessionId];
    }, 15000);
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

        if (Object.hasOwnProperty.call(config.static, 'event')) {
            options.event = config.static.event;
        }

        const authConfig = {
            productCode,
            url: config.static.authUrl,
            authPath: config.static.authPath,
            clientAuth: config.static.clientAuth,
            grantType: config.static.grantType,
            accessToken: config.static.accessToken,
            username: config.static.username,
            password: config.static.password,
            clientId: config.static.clientId,
            clientSecret: config.static.clientSecret,
            scope: config.static.scope,
        };

        if (Object.hasOwnProperty.call(config.static, 'scope')) {
            const requestOptions = await oauth2.request({authConfig}, {});
            options.accessToken = requestOptions.headers.Authorization;
        }

        // Close previous connection.
        if (Object.hasOwnProperty.call(sockets, productCode)) {
            winston.log('info', `${productCode}: Closing existing connection.`);
            try {
                sockets[productCode].close();
                await wait(2000);
                delete sockets[productCode];
            } catch (err) {
                delete sockets[productCode];
                winston.log('error', err.message);
            }
        }

        winston.log('info', `${productCode}: Initialize websocket connection.`);
        sockets[productCode] = new WebSocket(`${url}?accessToken=${options.accessToken}`, 'koneapi');
        sockets[productCode].on('open', () => {
            sockets[productCode].on('message', (data) => {
                const message = JSON.parse(data);
                console.log('message', message);
                if (message.data) {
                    cacheMessage(productCode, message.data.request_id, message);
                }
            });
            sockets[productCode].on(options.event, async message => {
                let template = cache.getDoc('templates', config.template);
                try {
                    const result = cache.getDoc('messages', productCode) || {};
                    // Replace resource path.
                    const path = template.generalConfig.hardwareId.dataObjectProperty;
                    let id;
                    if (Object.hasOwnProperty.call(message, path)) {
                        id = message[path];
                    } else {
                        id = options.event;
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
                            id = options.event;
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
        }).on('error', (err) => {
            winston.log('error', err.message);
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
 * Wait for message.
 *
 * @param {String} productCode
 * @param {String} id
 */
function waitForMessage (productCode, id) {
    function waitFor () {
        if ((messages[productCode] || {})[id]) {
            const result = messages[productCode][id];
            delete messages[productCode][id];
            return result;
        }
        return new Promise((resolve) => setTimeout(resolve, 1000))
            .then(() => waitFor());
    }
    return waitFor();
}

/**
 * Handles request to send data FROM connector (to websocket server).
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Promise}
 */
const sendData = async (config= {}, pathArray) => {
    const client = sockets[config.productCode];
    const items = [];

    for (let p = 0; p < pathArray.length; p++) {
        try {
            client.send(JSON.stringify(pathArray[p].data));
            const item = await Promise.race([
                waitForMessage(config.productCode, pathArray[p].id),
                wait(30000),
            ]);
            items.push(item ? item : {data: {request_id: pathArray[p].id, success: false}});
        } catch (err) {
            winston.log('error', err.message);
        }
    }

    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    connect,
    getData,
    sendData,
};
