'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const rsa = require('../../app/lib/rsa');
const moment = require('moment');
const _ = require('lodash');

/**
 * C4 CALS multi-purpose plugin for CALS and vendor connectors.
 */

const PLUGIN_NAME = 'onninen';
const orderNumberToCALSId = {};
const productCodeToCALSId = {};

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, id, data) {
    let object = {};
    try {
        const key = 'order';

        for (let j = 0; j < data.length; j++) {
            let result = {};
            const value = data[j][config.output.value];
            if (Object.keys(config.dataPropertyMappings).includes('OrderConfirmation')) {
                // Detect the need for transformation.
                // TODO: Detect order confirmation.
                if (Object.hasOwnProperty.call(value, 'project')) {
                    // Output has already been transformed.
                    result = {
                        [key]: {
                            ...value,
                        },
                    };
                } else {
                    // Transform raw input.
                    result = {
                        [key]: {
                            ...value,
                        },
                    };
                }
            } else {
                result = {
                    demandSupply: {
                        'type': 'SupplyInformation',
                        ...value,
                    },
                };
            }

            // Merge all to same result.
            if (Object.hasOwnProperty.call(object, key)) {
                if (!Array.isArray(object[key])) {
                    object[key] = [object[key]];
                }
                if (!Array.isArray(result[key])) {
                    result[key] = [result[key]];
                }
                object[key].push(...result[key]);
            } else {
                object = result;
            }
        }
        if (JSON.stringify(object) === '{}') {
            object = {[key]: []};
        }
        return object;
    } catch (err) {
        winston.log('error', err.message);
        return object;
    }
};

/**
 * Handles response.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        // TODO: handle order confirmation
        return response;
    } catch (e) {
        return response;
    }
};

/**
 * Transforms output to Platform of Trust context schema.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    // Initialize harmonized output.
    const result = {
        [config.output.context]: config.output.contextValue,
        [config.output.object]: {
            [config.output.array]: [],
        },
    };

    // Hand over data objects to transformer.
    try {
        const array = output.data[config.output.array];
        for (let i = 0; i < array.length; i++) {
            result[config.output.object][config.output.array].push(
                handleData(
                    config,
                    array[i][config.output.id],
                    array[i][config.output.data],
                ));
        }
        if (result[config.output.object][config.output.array].length === 1) {
            result[config.output.object] =
                result[config.output.object][config.output.array][0];
        } else {
            result[config.output.object][config.output.array] =
                result[config.output.object][config.output.array].map((o => {
                    return Object.values(o);
                })).flat(2);
        }

        return result;
    } catch (err) {
        winston.log('error', err.message);
        return output;
    }
};

/**
 * Switch querying protocol to REST.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        if (Object.hasOwnProperty.call(template.parameters.targetObject, 'sender')) {
            /** Vendor connector */
            winston.log('info', 'Received produced data from '
                + template.parameters.targetObject.sender.productCode
                + ' with vendorId ' + template.parameters.targetObject.vendor.idLocal,
            );
            const id = template.parameters.targetObject.vendor.idLocal;
            const result = cache.getDoc('messages', template.productCode) || {};
            result[id] = template.parameters.targetObject || {};

            // TODO: Store received order to cache?
            cache.setDoc('messages', template.productCode, result);

            // Stream data to external system.
            try {
                result[id].idLocal = result[id].idLocal || 'Unknown';
                result[id].idSystemLocal = result[id].idSystemLocal || 'Unknown';
                orderNumberToCALSId[result[id].idLocal] = result[id].idSystemLocal;

                if (!Object.hasOwnProperty.call(result[id], 'customer')) {
                    result[id].customer = {};
                }

                if (!Object.hasOwnProperty.call(productCodeToCALSId, result[id].idSystemLocal)) {
                    productCodeToCALSId[result[id].idSystemLocal] = {};
                }

                for (let i = 0; i < result[id].orderLine.length; i++) {
                    // Store id mappings.
                    productCodeToCALSId[result[id].idSystemLocal][result[id].orderLine[i].product.codeProduct] = result[id].orderLine[i].idSystemLocal;
                }

                // winston.log('info', 'Store CALS identifiers from received order.');
                // winston.log('info', 'orderNumberToCALSId: ' + JSON.stringify(orderNumberToCALSId));
                // winston.log('info', 'productCodeToCALSId: ' + JSON.stringify(productCodeToCALSId));

                // Pick Onninen endpoint from config.
                config.static.url = config.static.endpoint;
                template.output.contextValue = 'https://standards.oftrust.net/v2/Context/DataProductOutput/OrderInformation/';

                // Send a complete PoT broker response instead of just the targetObject.
                // Compose a signed data response.
                const created = moment().format();
                const output = {
                    '@context': template.output.contextValue,
                    data: {
                        order: result[id],
                    },
                };
                const brokerResponse = {
                    ...(output || {}),
                    signature: {
                        type: 'RsaSignature2018',
                        created,
                        creator: template.authConfig.connectorURL + '/translator/v1/public.key',
                        signatureValue: rsa.generateSignature({
                            __signed__: created,
                            ...(output['data'] || {}),
                        }),
                    },
                };

                winston.log('info', '3. Send data to URL ' + config.static.url);
                await template.plugins.find(p => p.name === 'streamer').stream({...template, config}, {data: {order: brokerResponse}});

                template.protocol = 'hook';
                template.authConfig.path = id;
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return template;
    } catch (err) {
        return Promise.reject(err);
    }
};

/**
 * Attempts to send received confirmation to CALS via PoT Broker.
 *
 * @param {Object} template
 * @param {Object} data
 * @return {Object}
 */
const stream = async (template, data) => {
    const responses = [];
    const errors = [];

    if (!Array.isArray(data)) {
        data = [data];
    }

    for (let i = 0; i < data.length; i++) {
        try {
            const config = template.config;
            // 1. Parse receiver productCode from received confirmation and send broker request to produce confirmation.
            let receiverProductCode;
            try {
                receiverProductCode = 'purchase-order-from-cals';
                // Get receiver from config.
                receiverProductCode = config.plugins.broker.receiver;
            } catch (err) {
                winston.log('info', 'Set receiver data product as ' + receiverProductCode + '.');
            }

            winston.log('info', '1. From: ' + template.productCode);

            const result = data[i];
            const keys = Object.keys(result.data);
            const key = keys[0];
            template.output.array = key;

            if (!Array.isArray(result.data[key])) {
                result.data[key] = [result.data[key]];
            }

            // Resolve ids.
            result.data[key].map((order) => {
                if (!Array.isArray(order.orderLine)) {
                    order.orderLine = [order.orderLine];
                }
                order.idLocal = order.idLocal || 'Unknown';
                order.idSystemLocal = orderNumberToCALSId[order.idLocal];
                order.idSystemLocal = order.idSystemLocal || 'Unknown';

                if (!Object.hasOwnProperty.call(productCodeToCALSId, order.idSystemLocal)) {
                    productCodeToCALSId[order.idSystemLocal] = {};
                }

                order.orderLine = order.orderLine.map((l) => {
                    winston.log('info', 'Changed ' + l.product.codeProduct + ' to ' + productCodeToCALSId[order.idSystemLocal][l.product.codeProduct]);
                    return {
                        ...l,
                        idSystemLocal: productCodeToCALSId[order.idSystemLocal][l.product.codeProduct],
                    };
                });
                return order;
            });
            if (result.data[key].length === 1) {
                result.data[key] = result.data[key][0];
                if (Array.isArray(result.data[key])) {
                    if (result.data[key].length === 1) {
                        result.data[key] = result.data[key][0];
                    }
                }
            }

            // 2. Send data to vendor data product with broker plugin.
            if (template.plugins.find(p => p.name === 'broker') && template.config.plugins.broker) {
                // Set isTest.
                template.config.plugins.broker.parameters = {
                    isTest: false,
                };

                /** Sender data product */
                template.config.productCode = template.productCode;

                // Check for mapped receiver.
                if (_.isObject(receiverProductCode)) {
                    if (Object.hasOwnProperty.call(receiverProductCode, key)) {
                        receiverProductCode = receiverProductCode[key];
                    }
                }

                /** Receiver data product */
                config.static.productCode = receiverProductCode;

                winston.log('info', '2. Send received data to receiver data product ' + receiverProductCode + ', isTest=' + false);
                responses.push(await template.plugins.find(p => p.name === 'broker').stream(template, result));
            }
        } catch (err) {
            errors.push(err);
        }
    }

    // Detect errors.
    if (errors.length > 0) {
        throw errors[0];
    }

    return responses;
};

module.exports = {
    name: PLUGIN_NAME,
    template,
    output,
    response,
    stream,
};
