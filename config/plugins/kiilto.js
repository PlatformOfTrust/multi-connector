'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const connector = require('../../app/lib/connector');
const validator = require('../../app/lib/validator');
const router = require('express').Router();
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const rsa = require('../../app/lib/rsa');
const rp = require('request-promise');
const moment = require('moment');
const net = require('net');
const _ = require('lodash');

const CSVToJSON = require('csvtojson');

/**
 * C4 CALS multi-purpose plugin for CALS and vendor connectors.
 */

const PLUGIN_NAME = 'kiilto';
const PRIMARY_PRODUCT_CODE = 'C1EC2973-8A0B-4858-BF1E-3A0D0CEFE33A';
const orderNumberToCALSId = {};
const productCodeToCALSId = {};

// Source mapping.
const orderConfirmationSchema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/OrderConfirmation?v=2.0',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/OrderConfirmation/?v=2.0',
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
                    'type': 'object',
                    'source': null,
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
                        'idLocal': {
                            '$id': '#/properties/data/properties/order/properties/idLocal',
                            'source': 'OrderHed.PONum',
                            'type': 'string',
                            'title': 'Local identifier',
                            'description': 'Locally given identifier.',
                        },
                        'idSystemLocal': {
                            '$id': '#/properties/data/properties/order/properties/idSystemLocal',
                            'source': 'idSystemLocal',
                            'type': 'string',
                            'title': 'Local System identifier',
                            'description': 'Locally given system identifier.',
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
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/idLocal',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'idSystemLocal': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/idSystemLocal',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/name',
                                    'source': null,
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                            },
                        },
                        'orderLine': {
                            '$id': '#/properties/data/properties/order/properties/orderLine',
                            'source': 'OrderDtl',
                            'type': 'array',
                            'title': 'Order line',
                            'description': 'Order line.',
                            'required': [],
                            'items': {
                                '$id': '#/properties/data/properties/order/properties/orderLine/items',
                                'source': null,
                                'type': 'object',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/@type',
                                        'source': 'orderLineType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/idLocal',
                                        'source': 'OrderLine',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'idSystemLocal': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/idSystemLocal',
                                        'source': 'idSystemLocal',
                                        'type': 'string',
                                        'title': 'Local System identifier',
                                        'description': 'Locally given system identifier.',
                                    },
                                    'deliveryRequired': {
                                        '$id': '#/properties/data/properties/order/properties/deliveryRequired',
                                        'source': 'requiredDelivery',
                                        'type': 'string',
                                        'title': 'Required delivery time',
                                        'description': 'Required delivery time initiated typically by the orderer.',
                                    },
                                    'quantity': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/quantity',
                                        'source': 'OrderQty',
                                        'type': 'integer',
                                        'title': 'Quantity',
                                        'description': 'Quantity of specific objects.',
                                    },
                                    'unit': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/unit',
                                        'source': 'SalesUM',
                                        'type': 'string',
                                        'title': 'Unit',
                                        'description': 'Unit used (Defines unit which is used).',
                                    },
                                    'product': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Product',
                                        'description': 'Product.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/@type',
                                                'source': 'productType',
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'idLocal': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/idLocal',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                            },
                                            'idSystemLocal': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/idSystemLocal',
                                                'source': 'productIdSystemLocal',
                                                'type': 'string',
                                                'title': 'Local System identifier',
                                                'description': 'Locally given system identifier.',
                                            },
                                            'name': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/name',
                                                'source': 'LineDesc',
                                                'type': 'string',
                                                'title': 'Name',
                                                'description': 'Name.',
                                            },
                                            'codeProduct': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/codeProduct',
                                                'source': 'PartNum',
                                                'type': 'string',
                                                'title': 'Product code',
                                                'description': 'Unique product code given by manufacturer.',
                                            },
                                            'assemblyControlNumber': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/assemblyControlNumber',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'ACN number',
                                                'description': 'ACN number.',
                                            },
                                            'locationName': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/locationName',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Location name',
                                                'description': 'Location name.',
                                            },
                                            'groupName': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/groupName',
                                                'source': null,
                                                'type': 'integer',
                                                'title': 'Product group name',
                                                'description': 'Unique product group name given by manufacturer.',
                                            },
                                            'width': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/width',
                                                'source': null,
                                                'type': 'integer',
                                                'title': 'Width',
                                                'description': 'Object width.',
                                            },
                                            'height': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/height',
                                                'source': null,
                                                'type': 'integer',
                                                'title': 'Height',
                                                'description': 'Height.',
                                            },
                                            'length': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/length',
                                                'source': null,
                                                'type': 'integer',
                                                'title': 'Length',
                                                'description': 'Lenght.',
                                            },
                                            'weight': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/weight',
                                                'source': null,
                                                'type': 'number',
                                                'title': 'Weight',
                                                'description': 'Object weight.',
                                            },
                                            'url': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/url',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'URL address',
                                                'description': 'URL address.',
                                            },
                                            'ifcUrl': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/ifcUrl',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'IfcUrl',
                                                'description': 'IfcUrl.',
                                            },
                                            'location': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/location',
                                                'source': null,
                                                'type': 'object',
                                                'title': 'Location',
                                                'description': 'Location.',
                                                'required': [],
                                                'properties': {
                                                    '@type': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/location/properties/@type',
                                                        'source': null,
                                                        'type': 'string',
                                                        'title': 'Identity type',
                                                        'description': 'Type of identity.',
                                                    },
                                                    'name': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/location/properties/name',
                                                        'source': null,
                                                        'type': 'string',
                                                        'title': 'Name',
                                                        'description': 'Name.',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    'processProduction': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Process Production',
                                        'description': 'Process Production.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction/properties/@type',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'production': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction/properties/production',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Production time',
                                                'description': 'Production time.',
                                            },
                                            'carbonDioxide': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction/properties/carbonDioxide',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Carbon dioxide level',
                                                'description': 'Carbon dioxide level.',
                                            },
                                            'location': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction/properties/location',
                                                'source': null,
                                                'type': 'object',
                                                'title': 'Location',
                                                'description': 'Location.',
                                                'required': [],
                                                'properties': {
                                                    '@type': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction/properties/location/properties/@type',
                                                        'source': null,
                                                        'type': 'string',
                                                        'title': 'Identity type',
                                                        'description': 'Type of identity.',
                                                    },
                                                    'name': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processProduction/properties/location/properties/name',
                                                        'source': null,
                                                        'type': 'string',
                                                        'title': 'Name',
                                                        'description': 'Name.',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    'processDelivery': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processDelivery',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Process Delivery',
                                        'description': 'Process Delivery.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processDelivery/properties/@type',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'carbonDioxide': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processDelivery/properties/carbonDioxide',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Carbon dioxide level',
                                                'description': 'Carbon dioxide level.',
                                            },
                                            'deliveryPlanned': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processDelivery/properties/deliveryPlanned',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Planned delivery time',
                                                'description': 'Planned delivery time.',
                                            },
                                            'deliveryActual': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processDelivery/properties/deliveryActual',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Actual delivery time',
                                                'description': 'Actual delivery time.',
                                            },
                                            'deliveryRequired': {
                                                '$id': '#/properties/data/properties/order/properties/orderLineitems//properties/processDelivery/properties/deliveryRequired',
                                                'source': 'requiredDelivery',
                                                'type': 'string',
                                                'title': 'Required delivery time',
                                                'description': 'Required delivery time initiated typically by the orderer.',
                                            },
                                        },
                                    },
                                    'processInstallation': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processInstallation',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Process Installation',
                                        'description': 'Process Installation.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processInstallation/properties/@type',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'installationPlanned': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processInstallation/properties/installationPlanned',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Planned installation time',
                                                'description': 'Planned installation time.',
                                            },
                                            'installationActual': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processInstallation/properties/installationActual',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Installation Actual',
                                                'description': 'Installation Actual.',
                                            },
                                        },
                                    },
                                    'processLoading': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Process Loading',
                                        'description': 'Process Loading.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading/properties/@type',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'idLocal': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading/properties/idLocal',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                            },
                                            'status': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading/properties/status',
                                                'source': null,
                                                'type': 'object',
                                                'title': 'Life-cycle status',
                                                'description': 'Life-cycle status.',
                                                'required': [],
                                                'properties': {
                                                    '@type': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading/properties/status/properties/@type',
                                                        'source': null,
                                                        'type': 'string',
                                                        'title': 'Identity type',
                                                        'description': 'Type of identity.',
                                                    },
                                                    'name': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading/properties/status/properties/name',
                                                        'source': null,
                                                        'type': 'string',
                                                        'title': 'Name',
                                                        'description': 'Name.',
                                                    },
                                                    'statusCode': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/processLoading/properties/status/properties/statusCode',
                                                        'source': null,
                                                        'type': 'integer',
                                                        'title': 'Life-cycle status code',
                                                        'description': 'Life-cycle status code.',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} [headers]
 * @param {String/Object/Array} [body]
 * @return {Promise}
 */
function request (method, url, headers, body) {
    const options = {
        method: method,
        uri: url,
        json: true,
        body: body,
        resolveWithFullResponse: true,
        headers: headers,
    };

    return rp(options).then(result => Promise.resolve(result))
        .catch((error) => {
            return Promise.reject(error);
        });
}

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
        const key = Object.keys(orderConfirmationSchema.properties.data.properties)[0];

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
                    value.type = 'OrderConfirmation';
                    value.projectType = 'Project';
                    value.descriptionGeneral = 'Purchase order confirmation.';
                    value.locationType = 'Location';

                    try {
                        const orderNumber = _.get(value, 'OrderHed.PONum');
                        value.idSystemLocal = orderNumberToCALSId[orderNumber];

                        if (!Object.hasOwnProperty.call(productCodeToCALSId, value.idSystemLocal)) {
                            productCodeToCALSId[value.idSystemLocal] = {};
                        }

                        let requiredDelivery = value['NeedByDate'];
                        if (requiredDelivery) {
                            requiredDelivery = value['NeedByTime'] ? new Date(requiredDelivery + 'T' + value['NeedByTime']).toISOString() : new Date(requiredDelivery).toISOString();
                        }
                        value.requiredDelivery = requiredDelivery;

                        value['OrderDtl'] = value['OrderDtl'].map((i) => {
                            let itemRequiredDelivery = i['NeedByDate'];
                            if (itemRequiredDelivery) {
                                itemRequiredDelivery = i['NeedByTime'] ? new Date(itemRequiredDelivery + 'T' + i['NeedByTime']).toISOString() : new Date(itemRequiredDelivery).toISOString();
                            }
                            return {
                                orderLineType: 'OrderLine', productType: 'Product', ...i, idSystemLocal: productCodeToCALSId[value.idSystemLocal][i['PartNum']], requiredDelivery: itemRequiredDelivery || requiredDelivery,
                            };
                        });
                    } catch (e) {
                        console.log(e.message);
                    }

                    result = transformer.transform(value, orderConfirmationSchema.properties.data);
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
 * Converts CSV to JSON.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        if (typeof response === 'string' || response instanceof String) response = CSVToJSON().fromString(response);
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
 * Local handler to send error response.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Error} err
 */
const errorResponse = async (req, res, err) => {
    let message;
    try {
        message = JSON.parse(err.message);
    } catch (e) {
        message = err.message;
    }
    // Compose error response object.
    const result = {
        error: {
            status: err.httpStatusCode || 500,
            message: message || 'Internal Server Error.',
            translator_response: err.translator_response || undefined,
        },
    };

    // Send response.
    return res.status(err.httpStatusCode || 500).send(result);
};

// TODO: Not in use.
/**
 * Endpoint to trigger fetching of new data from CALS.
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
        /** Request header validation */
        /*
        const bearer = req.headers.authorization;
        if (!bearer) {
            const err = new Error('Missing required header \'Authorization\'');
            err.httpStatusCode = 422;
            return errorResponse(req, res, err);
        }
        */

        /** Request body validation */
        const validation = validator.validate(req.body, {
            filename: {
                required: true,
            },
            container: {
                required: true,
            },
        });

        if (Object.hasOwnProperty.call(validation, 'error')) {
            if (validation.error) {
                const err = new Error(JSON.stringify(validation.error));
                err.httpStatusCode = 422;
                return errorResponse(req, res, err);
            }
        }

        // 1. Parse options and authenticate request.
        let config;
        let template;
        let productCode;
        try {
            const parts = req.originalUrl.split('/');
            productCode = parts.splice(parts.indexOf(PLUGIN_NAME) + 1)[0];
            config = cache.getDoc('configs', productCode) || {};

            if (_.isEmpty(config) || !Object.hasOwnProperty.call(config, 'static')) {
                const err = new Error('Data product configuration not found.');
                err.httpStatusCode = 404;
                return errorResponse(req, res, err);
            }

            /** Request authentication */
            /*
            if (!Object.hasOwnProperty.call(config.static, 'bearer')) {
                const err = new Error('Bearer not found at data product configuration.');
                err.httpStatusCode = 500;
                return errorResponse(req, res, err);
            }

            if (bearer !== ('Bearer ' + config.static.bearer)) {
                return res.status(401).send('Unauthorized');
            }
            */

            winston.log('info', 'Received trigger request from ' + (req.get('x-real-ip') || req.get('origin') || req.socket.remoteAddress));

            template = cache.getDoc('templates', config.template) || {};
            host = req.get('host').split(':')[0];
            config.connectorURL = (host === 'localhost' || net.isIP(host) ? 'http' : 'https') + '://' + req.get('host');
        } catch (err) {
            err.httpStatusCode = 500;
            err.message = 'Failed to handle request.';
            return errorResponse(req, res, err);
        }

        // 2. Get new data from vendor with parameters provided in the body.
        try {
            // Compose triggered local connector request.
            const triggeredReq = {
                body: {
                    productCode,
                    'timestamp': moment().format(),
                    'parameters': {
                        'targetObject': {
                            idLocal: req.body.filename,
                        },
                    },
                },
                protocol: 'http',
                get: function () {
                    return config.connectorURL;
                },
            };

            winston.log('info', '1. Query self with path ${targetObject.idLocal} as ' + req.body.filename);
            result = await connector.getData(triggeredReq);
        } catch (err) {
            winston.log('error', err.message);
            return errorResponse(req, res, err);
        }

        // 3. Parse receiver productCode from received confirmation and send broker request to produce confirmation.
        let receiverProductCode;
        try {
            // Fallback.
            receiverProductCode = 'purchase-order-from-cals';
            // Get receiver from config.
            receiverProductCode = config.plugins.broker.receiver;
        } catch (err) {
            winston.log('info', 'Set receiver data product as ' + receiverProductCode + '.');
        }

        // 4. Send data to vendor data product with broker plugin.
        try {
            /** Sender data product */
            config.productCode = productCode;
            /** Receiver data product */
            config.static.productCode = receiverProductCode;

            template = await connector.resolvePlugins(template);
            template.config = config;
            winston.log('info', '2. Send received data to receiver data product ' + receiverProductCode + ', isTest=' + req.body.is_test);

            try {
                if (!Array.isArray(result.output.data.order)) {
                    result.output.data.order = [result.output.data.order];
                }
                // Resolve ids.
                result.output.data.order.map((order) => {
                    if (!Array.isArray(order.deliveryLine)) {
                        order.deliveryLine = [order.deliveryLine];
                    }

                    order.idLocal = order.idLocal || 'Unknown';
                    order.idSystemLocal = orderNumberToCALSId[order.idLocal];
                    order.idSystemLocal = order.idSystemLocal || 'Unknown';

                    if (!Object.hasOwnProperty.call(productCodeToCALSId, order.idSystemLocal)) {
                        productCodeToCALSId[order.idSystemLocal] = {};
                    }

                    order.deliveryLine = order.deliveryLine.map((l) => {
                        if (!Object.hasOwnProperty.call(productCodeToCALSId, order.idSystemLocal)) {
                            productCodeToCALSId[order.idSystemLocal] = {};
                        }
                        winston.log('info', 'Changed ' + l.product.codeProduct + ' to ' + productCodeToCALSId[order.idSystemLocal][l.product.codeProduct]);
                        return {
                            ...l,
                            idSystemLocal: productCodeToCALSId[order.idSystemLocal][l.product.codeProduct],
                        };
                    });
                    return order;
                });
            } catch (e) {
                console.log(e.message);
            }

            if (template.plugins.find(p => p.name === 'broker') && template.config.plugins.broker) {
                // Set isTest.
                template.config.plugins.broker.parameters = {
                    isTest: req.body.is_test,
                };

                await template.plugins.find(p => p.name === 'broker').stream(template, result.output);
            }
        } catch (err) {
            winston.log('error', err.message);
            return errorResponse(req, res, err);
        }

        // 5. Send signed data response.
        const created = moment().format();
        res.status(200).send({
            ...(result.output || {}),
            signature: {
                type: 'RsaSignature2018',
                created,
                creator: config.connectorURL + '/translator/v1/public.key',
                signatureValue: rsa.generateSignature({
                    __signed__: created,
                    ...(result.output[result.payloadKey || 'data'] || {}),
                }),
            },
        });
    } catch (err) {
        if (!res.finished) {
            return errorResponse(req, res, err);
        }
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

                winston.log('info', 'Store CALS identifiers from received order.');
                winston.log('info', 'orderNumberToCALSId: ' + JSON.stringify(orderNumberToCALSId));
                winston.log('info', 'productCodeToCALSId: ' + JSON.stringify(productCodeToCALSId));

                // Pick Kiilto endpoint from config.
                config.static.url = config.static.endpoint;

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
                // template.generalConfig.hardwareId.dataObjectProperty = 'idLocal';
                template.output.contextValue = 'https://standards.oftrust.net/v2/Context/DataProductOutput/OrderInformation/';
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
