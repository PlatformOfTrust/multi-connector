'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const router = require('express').Router();
const response = require('../lib/response');
const winston = require('../../logger.js');
const rsa = require('../../app/lib/rsa');
const cache = require('../cache');
const moment = require('moment');
const net = require('net');
const _ = require('lodash');

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
    let result;
    try {
        result = await connector.composeOutput(template);
        await callback(template, _.flatten([result.output]));
    } catch (err) {
        winston.log('error', err.message);
    }
    return result;
};

const handler = async (productCode, config, topic, message) => {
    let output;
    try {
        const result = cache.getDoc('messages', productCode) || {};
        result[topic] = message;
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
            let id;
            if (Object.hasOwnProperty.call(message, path)) {
                id = message[path];
            } else {
                id = topic || 'latest';
            }
            template.authConfig.path = [id];
        }

        // Execute stream plugin function.
        for (let i = 0; i < template.plugins.length; i++) {
            if (template.plugins[i].stream) {
                // Compose plugin config, which has plugin specific options.
                const pluginConfig = (config.plugins ? config.plugins[template.plugins[i].name] || {} : {});
                output = await composeDataObject({
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
    return output;
};

/**
 * Returns the data to the PoT Broker API
 * based on the parameters sent.
 *
 * @param {Object} req
 * @param {Object} res
 * @return
 *   The translator data.
 */
const controller = async (req, res) => {
    let result;
    let host;
    try {
        // TODO: Place authentication.
        const topic = req.params.topic;
        const parts = req.originalUrl.split('/');
        const productCode = parts.splice(parts.indexOf('hooks') + 1)[0];
        const config = cache.getDoc('configs', productCode) || {};

        // Store data.
        host = req.get('host').split(':')[0];
        config.connectorURL = (host === 'localhost' || net.isIP(host) ? 'http' : 'https')
            + '://' + req.get('host');
        result = await handler(productCode, config, topic, req.body);

        // Initialize signature object.
        const signature = {
            type: 'RsaSignature2018',
            created: moment().format(),
            creator: config.connectorURL + '/translator/v1/public.key',
        };

        // Send signed data response.
        res.status(201).send({
            ...(result.output || {}),
            signature: {
                ...signature,
                signatureValue: rsa.generateSignature({
                    __signed__: signature.created,
                    ...(result.output[result.payloadKey || 'data'] || {}),
                }),
            },
        });
    } catch (err) {
        if (!res.finished) {
            // Compose error response object.
            result = {
                error: {
                    status: err.httpStatusCode || 500,
                    message: err.message || 'Internal Server Error.',
                },
            };

            // Send response.
            return res.status(err.httpStatusCode || 500).send(result);
        }
    }
};

/**
 * Returns plugin HTTP endpoints.
 *
 * @param {Object} passport
 * @return {Object}
 */
const endpoints = function (passport) {
    /** Hook endpoint. */
    router.post('/:topic*?', controller);
    return router;
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
    endpoints,
};
