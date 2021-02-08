'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const connector = require('../../app/lib/connector');
const router = require('express').Router();
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const rsa = require('../../app/lib/rsa');
const moment = require('moment');
const net = require('net');
const _ = require('lodash');

/**
 * C4 CALS  plugin.
 */

/** Import Platform of Trust definitions. */
const {brokerURLs} = require('../../config/definitions/pot');

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/OrderInformation?v=2.0',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/OrderInformation/?v=2.0',
            'title': 'JSON-LD context url',
            'description': 'JSON-LD context url with terms required to understand data product content.',
        },
        'data': {
            '$id': '#/properties/data',
            'source': null,
            'type': 'object',
            'title': 'Data product output',
            'description': 'Output of data product delivered to customers.',
            'required': [],
            'properties': {
                'order': {
                    '$id': '#/properties/data/properties/order',
                    'source': null,
                    'type': 'object',
                    'title': 'Order',
                    'description': 'Order.',
                    'required': [],
                    'properties': {
                        '@type': {
                            '$id': '#/properties/data/properties/order/properties/@type',
                            'source': 'type',
                            'type': 'string',
                            'title': 'Identity type',
                            'description': 'Type of identity.',
                        },
                        'deliveryRequired': {
                            '$id': '#/properties/data/properties/order/properties/deliveryRequired',
                            'source': 'requiredDeliveryDateTime',
                            'type': 'string',
                            'title': 'Required delivery time',
                            'description': 'Required delivery time initiated typically by the orderer',
                        },
                        'reference': {
                            '$id': '#/properties/data/properties/order/properties/reference',
                            'source': 'ourReference',
                            'type': 'string',
                            'title': 'Reference number/code',
                            'description': 'Reference number or code',
                        },
                        'codeQr': {
                            '$id': '#/properties/data/properties/order/properties/codeQr',
                            'source': 'purchaseOrderQRC',
                            'type': 'string',
                            'title': 'QR Code',
                            'description': 'QR Code.',
                        },
                        'descriptionGeneral': {
                            '$id': '#/properties/data/properties/order/properties/descriptionGeneral',
                            'source': 'descriptionGeneral',
                            'type': 'string',
                            'title': 'Description',
                            'description': 'Description.',
                        },
                        'project': {
                            '$id': '#/properties/data/properties/order/properties/project',
                            'source': null,
                            'type': 'object',
                            'title': 'Project',
                            'description': 'Project.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/@type',
                                    'source': 'projectType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/idLocal',
                                    'source': 'projectNumber',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'idSystemLocal': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/idSystemLocal',
                                    'source': 'projectId',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/name',
                                    'source': 'projectName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                            },
                        },
                        'contact': {
                            '$id': '#/properties/data/properties/order/properties/contact',
                            'source': null,
                            'type': 'object',
                            'title': 'Contact',
                            'description': 'Contact.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/contact/properties/@type',
                                    'source': 'contactType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/contact/properties/name',
                                    'source': 'purchaseOrderContactName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                                'addressEmail': {
                                    '$id': '#/properties/data/properties/order/properties/contact/properties/addressEmail',
                                    'source': 'purchaseOrderContactEmail',
                                    'type': 'string',
                                    'title': 'Email address',
                                    'description': 'Email address.',
                                },
                                'phoneNumber': {
                                    '$id': '#/properties/data/properties/order/properties/contact/properties/phoneNumber',
                                    'source': 'purchaseOrderContactTelephone',
                                    'type': 'string',
                                    'title': 'Phone number',
                                    'description': 'Phone number.',
                                },
                            },
                        },
                        'customer': {
                            '$id': '#/properties/data/properties/order/properties/customer',
                            'source': null,
                            'type': 'object',
                            'title': 'Customer',
                            'description': 'Customer.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/customer/properties/@type',
                                    'source': 'customerType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/customer/properties/idLocal',
                                    'source': 'customerId',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/customer/properties/name',
                                    'source': 'customerName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                            },
                        },
                        'vendor': {
                            '$id': '#/properties/data/properties/order/properties/vendor',
                            'source': null,
                            'type': 'object',
                            'title': 'Vendor',
                            'description': 'Vendor.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/@type',
                                    'source': 'vendorType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/idLocal',
                                    'source': 'vendorExternalId',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'idSystemLocal': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/idSystemLocal',
                                    'source': 'vendorId',
                                    'type': 'string',
                                    'title': 'System Local identifier',
                                    'description': 'Locally given system identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/name',
                                    'source': 'vendorName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                                'streetAddressLine1': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/streetAddressLine1',
                                    'source': 'vendorStreetAddress',
                                    'type': 'string',
                                    'title': 'Street address line 1',
                                    'description': 'Street address line 1.',
                                },
                                'postalCode': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/postalCode',
                                    'source': 'vendorPostalCode',
                                    'type': 'string',
                                    'title': 'Postal code',
                                    'description': 'Postal code.',
                                },
                                'postalArea': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/postalArea',
                                    'source': 'vendorTown',
                                    'type': 'string',
                                    'title': 'Postal area',
                                    'description': 'Postal area.',
                                },
                                'country': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/country',
                                    'source': 'vendorCountry',
                                    'type': 'string',
                                    'title': 'Country',
                                    'description': 'Location country name.',
                                },
                            },
                        },
                        'addressShipping': {
                            '$id': '#/properties/data/properties/order/properties/addressShipping',
                            'source': null,
                            'type': 'object',
                            'title': 'Shipping address',
                            'description': 'Shipping address.',
                            'required': [],
                            'properties': {
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/idLocal',
                                    'source': 'shipToId',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/name',
                                    'source': 'shipToName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                                'streetAddressLine1': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/streetAddressLine1',
                                    'source': 'shipToStreetAddress',
                                    'type': 'string',
                                    'title': 'Street address line 1',
                                    'description': 'Street address line 1.',
                                },
                                'postalCode': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/postalCode',
                                    'source': 'shipToPostalCode',
                                    'type': 'string',
                                    'title': 'Postal code',
                                    'description': 'Postal code.',
                                },
                                'postalArea': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/postalArea',
                                    'source': 'shipToTown',
                                    'type': 'string',
                                    'title': 'Postal area',
                                    'description': 'Postal area.',
                                },
                                'country': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/country',
                                    'source': 'shipToCountry',
                                    'type': 'string',
                                    'title': 'Country',
                                    'description': 'Location country name.',
                                },
                            },
                        },
                        'addressBilling': {
                            '$id': '#/properties/data/properties/order/properties/addressBilling',
                            'type': 'object',
                            'title': 'Billing address',
                            'description': 'Billing address.',
                            'required': [],
                            'properties': {
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/idLocal',
                                    'source': 'billToId',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/name',
                                    'source': 'billToName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                                'streetAddressLine1': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/streetAddressLine1',
                                    'source': 'billToStreetAddress',
                                    'type': 'string',
                                    'title': 'Street address line 1',
                                    'description': 'Street address line 1.',
                                },
                                'postalCode': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/postalCode',
                                    'source': 'billToPostalCode',
                                    'type': 'string',
                                    'title': 'Postal code',
                                    'description': 'Postal code.',
                                },
                                'postalArea': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/postalArea',
                                    'source': 'billToTown',
                                    'type': 'string',
                                    'title': 'Postal area',
                                    'description': 'Postal area',
                                },
                                'country': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/country',
                                    'source': 'billToCountry',
                                    'type': 'string',
                                    'title': 'Country',
                                    'description': 'Location country name.',
                                },
                            },
                        },
                    },
                },
            },
        },
        'signature': {
            '$id': '#/properties/signature',
            'type': 'object',
            'title': 'Signature',
            'description': 'Signature.',
            'required': [],
            'properties': {
                'type': {
                    '$id': '#/properties/signature/properties/type',
                    'type': 'string',
                    'title': 'Type',
                    'description': 'Type.',
                },
                'created': {
                    '$id': '#/properties/signature/properties/created',
                    'type': 'string',
                    'title': 'Created',
                    'description': 'Creation time.',
                },
                'creator': {
                    '$id': '#/properties/signature/properties/creator',
                    'type': 'string',
                    'title': 'Creator',
                    'description': 'Creator.',
                },
                'signatureValue': {
                    '$id': '#/properties/signature/properties/signatureValue',
                    'type': 'string',
                    'title': 'Signature value',
                    'description': 'Signature value.',
                },
            },
        },
    },
};

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, id, data) {
    let result = {};
    try {
        for (let j = 0; j < data.length; j++) {
            const value = data[j][config.output.value];
            if (Object.keys(config.dataPropertyMappings).includes('OrderInformation')) {
                value.type = 'OrderInformation';
                value.projectType = 'Project';
                value.contactType = 'Person';
                value.customerType = 'Organization';
                value.vendorType = 'Organization';
                value.descriptionGeneral = 'Purchase order information.';
                value.requiredDeliveryDateTime = new Date(value.requiredDeliveryDate + 'T' + value.requiredDeliveryTime);
                result = transformer.transform(value, schema.properties.data);
            } else {
                result = {
                    demandSupply: {
                        'type': 'DemandInformation',
                        ...value,
                    },
                };
            }
        }
        return result;
    } catch (err) {
        console.log(err.message);
        return result;
    }
};

/**
 * Consumes HubSpot API by given method.
 *
 * @param {Object} config
 * @param {Object/String} res
 * @return {Object}
 *   Response from HubSpot API
 */
const response = async (config, res) => {
    let response;

    /** Data fetching. */
    try {
        // Fetch data from cache.
        if (Object.hasOwnProperty.call(config.parameters.targetObject, 'vendor')) {
            console.log('Fetch from cache');
            const result = cache.getDoc('messages', config.productCode) || {};
            response = result[res];
        } else {
            response = res;
        }
    } catch (err) {
        console.log(err.message);
    }
    return response;
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
        console.log(err.message);
        return output;
    }
};

/**
 * Trigger endpoint to fetch new data from CALS.
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
        const productCode = parts.splice(parts.indexOf('c4-cals') + 1)[0];
        const config = cache.getDoc('configs', productCode) || {};
        let template = cache.getDoc('templates', config.template) || {};

        // Store data.
        host = req.get('host').split(':')[0];
        config.connectorURL = (host === 'localhost' || net.isIP(host) ? 'http' : 'https')
            + '://' + req.get('host');
        // result = await handler(productCode, config, topic, req.body);

        // Parse instance from request body.
        const triggeredReq = {
            body: {
                'productCode' : productCode,
                'timestamp': moment().format(),
                'parameters': {
                    'targetObject': {
                        'order': {
                            'idLocal': req.body.instanceId,
                        },
                    },
                },
            },
            protocol: 'http',
            get: function () {
                return 'localhost:8080';
            },
        };

        // 3. Parse data-product from order and send broker request to produce order.

        /**
         * "e0c9284c-84a0-425d-8e52-5ffdec39038b": "purchase-order-to-vendor-1"
         * "d61c39ca-3c7a-42a5-9909-a1a239ae6549": "purchase-order-to-vendor-2"
         */

        // Receives incoming trigger to fetch new data from CALS.
        // 1. Get new data from CALS with parameters provided in the body.
        // 2. Make a broker request to self and take data.

        winston.log('info', '1. Query self with REST path /instances/${instance}/purchaseorders/${instanceId}');

        // Fetch data.
        result = await connector.getData(triggeredReq);

        let vendorExternalId = 'purchase-order-to-vendor-1';
        try {
            vendorExternalId = result.body.vendorExternalId;
        } catch (e) {
            winston.log('error', 'Could not parse external id for vendor from response.');
        }

        winston.log('info', '2. Send data to vendor data product: ' + vendorExternalId);

        const url = config.static.env === 'development' ? config.connectorURL + '/translator/v1/fetch' : brokerURLs.find(i => i.env === (config.env || 'sandbox')).url;
        winston.log('info', url);

        /*
        const brokerReq = {
            body: {
                'productCode' : vendorExternalId,
                'timestamp': moment().format(),
                'parameters': {
                    'targetObject': {
                        'order': {
                            'idLocal': req.body.instanceId,
                        },
                    },
                },
            },
            protocol: 'http',
            get: function () {
                return 'localhost:8080';
            },
        };
        */

        // 4. Send data to vendor data product.

        config.static.productCode = vendorExternalId;
        template = await connector.resolvePlugins(template);
        template.config = config;
        try {
            await template.plugins.find(p => p.name === 'broker').stream(template, result.output);
        } catch (err) {
            winston.log('error', err.message);
        }

        // Streamer will send the data to the vendor.

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
    /** Trigger endpoint. */
    router.post('/:topic*?', controller);
    router.put('/:topic*?', controller);
    router.delete('/:topic*?', controller);
    return router;
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
        if (Object.hasOwnProperty.call(config.parameters.targetObject, 'vendor')) {
            winston.log('info', 'Connector consumes cache by vendorId.');
            template.authConfig.path = [template.parameters.targetObject.vendor.idLocal];
        } else if (Object.hasOwnProperty.call(config.parameters.targetObject, 'order')) {
            winston.log('info', 'Connector consumes CALS REST API by orderId.');
            template.protocol = 'rest';
            template.authConfig.path = '/instances/' + template.authConfig.instance + '/purchaseorders/' + template.authConfig.path;
        }

        return template;
    } catch (e) {
        return template;
    }
};

/**
 * Store produced data.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        // Detect that new data was produced.
        if (Object.hasOwnProperty.call(parameters.targetObject, '@type')) {
            console.log('Store received data to cache by vendorId: ' + parameters.targetObject.vendor.idLocal);
            const id = parameters.targetObject.vendor.idLocal;
            const result = cache.getDoc('messages', config.productCode) || {};
            result[id] = parameters.targetObject;
            cache.setDoc('messages', config.productCode, result);
        }
    } catch (err) {
        winston.log('error', err.message);
    }
    return parameters;
};

module.exports = {
    name: 'c4-cals',
    endpoints,
    template,
    output,
    parameters,
    response,
};
