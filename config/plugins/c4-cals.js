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
const moment = require('moment');
const net = require('net');
const _ = require('lodash');

/**
 * C4 CALS multi-purpose plugin for CALS and vendor connectors.
 */

const PLUGIN_NAME = 'c4-cals';
const orderIdToCALSInstanceId = {};
const orderNumberToCALSId = {};
const materialSecondaryCodeToCALSId = {};

// Source mapping.
const orderInformationSchema = {
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
                        'idLocal': {
                            '$id': '#/properties/data/properties/order/properties/idLocal',
                            'source': 'purchaseOrderNumber',
                            'type': 'string',
                            'title': 'Local identifier',
                            'description': 'Locally given identifier.',
                        },
                        'idSystemLocal': {
                            '$id': '#/properties/data/properties/order/properties/idSystemLocal',
                            'source': 'purchaseOrderId',
                            'type': 'string',
                            'title': 'Local system identifier',
                            'description': 'Locally given system identifier.',
                        },
                        'deliveryRequired': {
                            '$id': '#/properties/data/properties/order/properties/deliveryRequired',
                            'source': 'requiredDeliveryDateTime',
                            'type': 'string',
                            'title': 'Required delivery time',
                            'description': 'Required delivery time initiated typically by the orderer.',
                        },
                        'reference': {
                            '$id': '#/properties/data/properties/order/properties/reference',
                            'source': 'ourReference',
                            'type': 'string',
                            'title': 'Reference number/code',
                            'description': 'Reference number or code.',
                        },
                        'codeQr': {
                            '$id': '#/properties/data/properties/order/properties/codeQr',
                            'source': 'purchaseOrderQRC',
                            'type': 'string',
                            'title': 'CodeQr',
                            'description': 'CodeQr.',
                        },
                        'descriptionGeneral': {
                            '$id': '#/properties/data/properties/order/properties/descriptionGeneral',
                            'source': 'purchaseOrderInfo',
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
                                'contactInformation': {
                                    '$id': '#/properties/data/properties/order/properties/contact/properties/contactInformation',
                                    'source': null,
                                    'type': 'object',
                                    'title': 'Contact information',
                                    'description': 'Contact information.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/contact/properties/contactInformation/properties/@type',
                                            'source': 'contactInformationType',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'addressEmail': {
                                            '$id': '#/properties/data/properties/order/properties/contact/properties/contactInformation/properties/addressEmail',
                                            'source': 'purchaseOrderContactEmail',
                                            'type': 'string',
                                            'title': 'Email address',
                                            'description': 'Email address.',
                                        },
                                        'phoneNumber': {
                                            '$id': '#/properties/data/properties/order/properties/contact/properties/contactInformation/properties/phoneNumber',
                                            'source': 'purchaseOrderContactTelephone',
                                            'type': 'string',
                                            'title': 'Phone number',
                                            'description': 'Phone number.',
                                        },
                                    },
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
                                'idOfficial': {
                                    '$id': '#/properties/data/properties/order/properties/customer/properties/idOfficial',
                                    'source': 'customerBusinessId',
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
                                'idOfficial': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/idOfficial',
                                    'source': 'vendorBusinessId',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/name',
                                    'source': 'vendorName',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                                'ContactInformation': {
                                    '$id': '#/properties/data/properties/order/properties/vendor/properties/ContactInformation',
                                    'type': 'object',
                                    'title': 'Contact information',
                                    'description': 'Contact information.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/vendor/properties/ContactInformation/properties/@type',
                                            'source': 'contactInformationType',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'streetAddressLine1': {
                                            '$id': '#/properties/data/properties/order/properties/vendor/properties/ContactInformation/properties/streetAddressLine1',
                                            'source': 'vendorStreetAddress',
                                            'type': 'string',
                                            'title': 'Street address line 1',
                                            'description': 'Street address line 1.',
                                        },
                                        'postalCode': {
                                            '$id': '#/properties/data/properties/order/properties/vendor/properties/ContactInformation/properties/postalCode',
                                            'source': 'vendorPostalCode',
                                            'type': 'string',
                                            'title': 'Postal code',
                                            'description': 'Postal code.',
                                        },
                                        'postalArea': {
                                            '$id': '#/properties/data/properties/order/properties/vendor/properties/ContactInformation/properties/postalArea',
                                            'source': 'vendorTown',
                                            'type': 'string',
                                            'title': 'Postal area',
                                            'description': 'Postal area.',
                                        },
                                        'country': {
                                            '$id': '#/properties/data/properties/order/properties/vendor/properties/ContactInformation/properties/country',
                                            'source': 'vendorCountry',
                                            'type': 'string',
                                            'title': 'Country',
                                            'description': 'Location country name.',
                                        },
                                    },
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
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/addressShipping/properties/@type',
                                    'source': 'addressShippingType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
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
                            'source': null,
                            'type': 'object',
                            'title': 'Billing address',
                            'description': 'Billing address.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/@type',
                                    'source': 'addressBillingType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idSystemLocal': {
                                    '$id': '#/properties/data/properties/order/properties/addressBilling/properties/idSystemLocal',
                                    'source': 'billToId',
                                    'type': 'string',
                                    'title': 'Local system identifier',
                                    'description': 'Locally given system identifier.',
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
                                    'description': 'Postal area.',
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
                        'process': {
                            '$id': '#/properties/data/properties/order/properties/process',
                            'type': 'object',
                            'title': 'Process',
                            'description': 'Process.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/process/properties/@type',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'descriptionGeneral': {
                                    '$id': '#/properties/data/properties/order/properties/process/properties/descriptionGeneral',
                                    'type': 'string',
                                    'title': 'Description',
                                    'description': 'Description.',
                                },
                            },
                        },
                        'orderLine': {
                            '$id': '#/properties/data/properties/order/properties/orderLine',
                            'source': 'purchaseOrderItems',
                            'type': 'array',
                            'title': 'Order line',
                            'description': 'Order line.',
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
                                        'source': 'purchaseOrderItemNumber',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'idSystemLocal': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/idSystemLocal',
                                        'source': 'purchaseOrderItemId',
                                        'type': 'string',
                                        'title': 'Local system identifier',
                                        'description': 'Locally given system identifier.',
                                    },
                                    'quantity': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/quantity',
                                        'source': 'quantity',
                                        'type': 'integer',
                                        'title': 'Quantity',
                                        'description': 'Quantity of specific objects.',
                                    },
                                    'unit': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/unit',
                                        'source': 'unitOfMeasure',
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
                                                'source': 'materialPrimaryCode',
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                            },
                                            'codeProduct': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/codeProduct',
                                                'source': 'materialSecondaryCode',
                                                'type': 'string',
                                                'title': 'Product code',
                                                'description': 'Unique product code given by manufacturer.',
                                            },
                                            'descriptionGeneral': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/descriptionGeneral',
                                                'source': 'materialName',
                                                'type': 'string',
                                                'title': 'Description',
                                                'description': 'Description.',
                                            },
                                            'gtin': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/gtin',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Gtin',
                                                'description': 'Gtin.',
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
                // Detect the need for transformation.
                if (Object.hasOwnProperty.call(value, 'vendor')) {
                    // Output has already been transformed.
                    result = {
                        order: {
                            ...value,
                        },
                    };
                } else {
                    // Transform raw input.
                    value.type = 'OrderInformation';
                    value.projectType = 'Project';
                    value.contactType = 'Person';
                    value.contactInformationType = 'ContactInformation';
                    value.addressShippingType = 'ContactInformation';
                    value.addressBillingType = 'ContactInformation';
                    value.customerType = 'Organization';
                    value.vendorType = 'Organization';
                    // value.descriptionGeneral = 'Purchase order information.';
                    value.requiredDeliveryDateTime = new Date(value.requiredDeliveryDate + 'T' + value.requiredDeliveryTime).toISOString();
                    try {
                        orderNumberToCALSId[value.purchaseOrderNumber] = value.purchaseOrderId;
                        orderIdToCALSInstanceId[value.purchaseOrderId] = value.instanceId;
                        for (let i = 0; i < value.purchaseOrderItems.length; i++) {
                            if (!Object.hasOwnProperty.call(materialSecondaryCodeToCALSId, value.purchaseOrderId)) {
                                materialSecondaryCodeToCALSId[value.purchaseOrderId] = {};
                            }
                            materialSecondaryCodeToCALSId[value.purchaseOrderId][value.purchaseOrderItems[i].materialSecondaryCode] = value.purchaseOrderItems[i].purchaseOrderItemId;
                            value.purchaseOrderItems[i] = {
                                orderLineType: 'OrderLine',
                                productType: 'Product',
                                ...value.purchaseOrderItems[i],
                                purchaseOrderItemNumber: i + '0',
                            };
                        }
                        winston.log('info', 'Store CALS identifiers from sent order.');
                        // winston.log('info', 'orderNumberToCALSId: ' + JSON.stringify(orderNumberToCALSId));
                        // winston.log('info', 'orderIdToCALSInstanceId: ' + JSON.stringify(orderIdToCALSInstanceId));
                    } catch (e) {
                        console.log(e.message);
                    }
                    result = transformer.transform(value, orderInformationSchema.properties.data);
                }
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
        winston.log('error', err.message);
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
        // Fetch data from cache if query is done by vendor id (only for vendor connector).
        if (Object.hasOwnProperty.call(config.parameters.targetObject, 'vendor')) {
            const result = cache.getDoc('messages', config.productCode) || {};
            response = result[res];
        } else {
            response = res;
        }
    } catch (err) {
        winston.log('error', err.message);
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
        const bearer = req.headers.authorization;
        if (!bearer) {
            const err = new Error('Missing required header \'Authorization\'');
            err.httpStatusCode = 422;
            return errorResponse(req, res, err);
        }

        /** Request body validation */
        const validation = validator.validate(req.body, {
            eventId: {
                required: true,
            },
            entity: {
                required: true,
            },
            method: {
                required: true,
            },
            instanceId: {
                required: true,
            },
            entityId: {
                required: true,
            },
            /*
            isTest: {
                required: true,
            },
            */
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

            if (!Object.hasOwnProperty.call(config.static, 'bearer')) {
                const err = new Error('Bearer not found at data product configuration.');
                err.httpStatusCode = 500;
                return errorResponse(req, res, err);
            }

            /** Request authentication */
            if (bearer !== ('Bearer ' + config.static.bearer)) {
                return res.status(401).send('Unauthorized');
            }

            winston.log('info', 'Received trigger request from ' + (req.get('x-real-ip') || req.get('origin') || req.socket.remoteAddress));

            template = cache.getDoc('templates', config.template) || {};
            host = req.get('host').split(':')[0];
            config.connectorURL = (host === 'localhost' || net.isIP(host) ? 'http' : 'https') + '://' + req.get('host');
        } catch (err) {
            err.httpStatusCode = 500;
            err.message = 'Failed to handle request.';
            return errorResponse(req, res, err);
        }

        // TODO: FOR TESTING PURPOSES ONLY.
        // purchaseOrderIdToInstanceId[req.body.entityId] = req.body.instanceId;

        // 2. Get new data from CALS with parameters provided in the body.
        try {
            // Compose triggered local connector request.
            const triggeredReq = {
                body: {
                    productCode,
                    'timestamp': moment().format(),
                    'parameters': {
                        eventId: req.body.eventId,
                        entity: req.body.entity,
                        instanceId: req.body.instanceId,
                        isTest: req.body.isTest,
                        'targetObject': {
                            'order': {
                                idLocal: req.body.entityId,
                            },
                        },
                    },
                },
                protocol: 'http',
                get: function () {
                    return config.connectorURL;
                },
            };
            const resource = (req.body.entity + 's').toLowerCase();
            winston.log('info', '1. Query self with REST path /instances/${instanceId}/' + resource + '/${entityId}');
            result = await connector.getData(triggeredReq);
            // Check that an order was found in the response.
            try {
                if (JSON.stringify(result.output[result.payloadKey].order) === '[]') {
                    const err = new Error('Purchase order with entityId ' + req.body.entityId + ' with instance ID ' + req.body.instanceId + ' not found.');
                    err.httpStatusCode = 400;
                    return errorResponse(req, res, err);
                }
            } catch (err) {
                winston.log('error', err.message);
                const validationFailed = new Error('Failed to process CALS response.');
                validationFailed.httpStatusCode = 500;
                return errorResponse(req, res, validationFailed);
            }
        } catch (err) {
            winston.log('error', err.message);
            return errorResponse(req, res, err);
        }

        // 3. Parse vendor productCode from received order and send broker request to produce order.
        let vendorProductCode;
        try {
            vendorProductCode = 'vendor-purchase-order';
            vendorProductCode = result.output.data.order.vendor.idLocal;
        } catch (err) {
            const message = 'Could not parse vendor external id from CALS response.';
            winston.log('error', message);
            return errorResponse(req, res, new Error(message));
        }

        // 4. Send data to vendor data product with broker plugin.
        try {
            /** Sender data product */
            config.productCode = productCode;
            /** Receiver data product */
            config.static.productCode = vendorProductCode;

            if (req.body.isTest) {
                /** Test message response */
                res.setHeader('x-event-id', req.body.eventId);
                res.setHeader('x-is-pot', true);
                res.setHeader('x-is-test', req.body.isTest);
                winston.log('info', '2. Skip sending to ' + vendorProductCode + ', isTest=' + req.body.isTest);
            } else {
                template = await connector.resolvePlugins(template);
                template.config = config;
                winston.log('info', '2. Send received data to vendor data product ' + vendorProductCode);
                await template.plugins.find(p => p.name === 'broker').stream(template, result.output);
            }
        } catch (err) {
            winston.log('error', err.message);
            return errorResponse(req, res, err);
        }

        // 5. Send signed data response.
        const created = moment().format();
        res.status(201).send({
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
        if (Object.hasOwnProperty.call(template.parameters.targetObject, 'vendor')) {
            /** Vendor connector */
            template.authConfig.path = [template.parameters.targetObject.vendor.idLocal];
        } else if (Object.hasOwnProperty.call(template.parameters.targetObject, 'order')) {
            /** CALS connector */
            const resource = (template.authConfig.entity + 's').toLowerCase();

            winston.log('info', 'Connector consumes CALS REST API ' + resource + ' by entityId ' + template.authConfig.path);
            template.protocol = 'rest';
            template.authConfig.headers = {
                ...template.authConfig.headers,
                'x-event-id': template.authConfig.eventId,
                'x-is-pot': true,
                'x-is-test': template.authConfig.isTest === 'true',
            };
            winston.log('info', 'Include headers from trigger request' + ', '
                + 'x-event-id: ' + template.authConfig.headers['x-event-id'] + ', '
                + 'x-is-test: ' + template.authConfig.headers['x-is-test']);
            template.authConfig.path = '/instances/' + template.authConfig.instanceId + '/' + resource + '/' + template.authConfig.path;
        }

        if (Object.hasOwnProperty.call(template.parameters.targetObject, 'sender')) {
            /** CALS connector */
            winston.log('info', 'Received produced data from '
                + template.parameters.targetObject.sender.productCode
                + ' with orderId ' + template.parameters.targetObject.idLocal);

            const id = template.parameters.targetObject.idLocal;
            const result = cache.getDoc('messages', template.productCode) || {};
            result[id] = template.parameters.targetObject;
            cache.setDoc('messages', template.productCode, result);

            template.authConfig.path = id;

            // Stream data to external system.
            try {
                // Transform
                const data = {};

                // 1. Parse PurchaseOrderId - template.parameters.targetObject.idLocal
                data.PurchaseOrderNumber = template.parameters.targetObject.idLocal;
                data.PurchaseOrderId = orderNumberToCALSId[data.PurchaseOrderNumber] || template.parameters.targetObject.idSystemLocal;
                data.InstanceId = orderIdToCALSInstanceId[data.PurchaseOrderId];

                winston.log('info', 'Resolved ' + data.PurchaseOrderNumber + ' to PurchaseOrderId ' + data.PurchaseOrderId);
                winston.log('info', 'Resolved ' + data.PurchaseOrderId + ' to InstanceId ' + data.InstanceId);

                const items = template.parameters.targetObject.orderLine || template.parameters.targetObject.deliveryLine || [];

                // 2. Parse PurchaseOrderItems - template.parameters.targetObject.orderLine or -.deliveryLine
                data.PurchaseOrderItems = items.map(input => {
                    const output = {};
                    // Root level delivery datetime by default.
                    let datetime = template.parameters.targetObject.deliveryRequired;

                    // Catch transportation/delivery time from delivery information.
                    if (!datetime && Object.hasOwnProperty.call(input, 'transportation')) {
                        if (input.transportation.endDateTime !== '') {
                            datetime = input.transportation.endDateTime;
                            output.ActualDelivery = [];
                        }
                    }
                    if (!datetime && Object.hasOwnProperty.call(input, 'delivery')) {
                        if (input.delivery.startDateTime !== '') {
                            datetime = input.delivery.startDateTime;
                            output.ActualDelivery = [];
                        }
                    }

                    // Set per order line if available.
                    if (!datetime) {
                        datetime = input.deliveryRequired;
                    }

                    // Resolve CALSId.
                    try {
                        output.PurchaseOrderItemId = materialSecondaryCodeToCALSId[data.PurchaseOrderId][input.product.codeProduct];
                    } catch (e) {
                        output.PurchaseOrderItemId = input.idSystemLocal;
                    }

                    try {
                        datetime = new Date(datetime).toISOString();
                        output.ConfirmedDeliveryDate = (datetime || 'T').split('T')[0];
                        output.ConfirmedDeliveryTime = (datetime || 'T').split('T')[1].substring(0, 5);

                        // Delete unavailable delivery times.
                        if (output.ConfirmedDeliveryDate === '') {
                            delete output.ConfirmedDeliveryDate;
                        }
                        if (output.ConfirmedDeliveryTime === '') {
                            delete output.ConfirmedDeliveryTime;
                        }
                    } catch (e) {
                        winston.log('error', e.message);
                    }

                    if (!output.PurchaseOrderItemId) {
                        // Attach meta.
                        if (Object.hasOwnProperty.call(input, 'product')) {
                            output.materialSecondaryCode = input.product.codeProduct;
                            output.materialName = input.product.name;
                        }
                    }

                    // Compose actual delivery array.
                    if (Object.hasOwnProperty.call(output, 'ActualDelivery')) {
                        output.ActualDelivery.push(
                            {
                                ID: (input.delivery || {}).idLocal,
                                Quantity: input.quantity,
                                ActualDeliveryDate: output.ConfirmedDeliveryDate,
                                ActualDeliveryTime: output.ConfirmedDeliveryTime,
                            },
                        );
                        delete output.ConfirmedDeliveryDate;
                        delete output.ConfirmedDeliveryTime;
                    }

                    return output;
                });

                winston.log('info', 'Body: ' + JSON.stringify(data));

                if (!data.InstanceId) {
                    return Promise.reject(new Error('Could not resolve CALS instance ID. Resending the order from CALS is required.'));
                }

                config.static.url = 'https://c4-prod-apim.azure-api.net/pot/instances/' + data.InstanceId + '/confirmpurchaseorder';
                config.static.headers = {
                    'CALS-API-KEY': config.static.apikey,
                    'x-is-test': template.authConfig.isTest === 'true',
                };

                winston.log('info', 'Include headers from received broker request' + ', '
                    + 'x-is-test: ' + config.static.headers['x-is-test']);
                winston.log('info', '3. Send data to URL ' + config.static.url);

                await template.plugins.find(p => p.name === 'streamer')
                    .stream({...template, config}, {data: {order: data}});

            } catch (err) {
                winston.log('info', err.message);
                return Promise.reject(err);
            }
        }

        if (!template.authConfig.path) {
            const error = new Error('Bad request. Could not recognize supported query. Bad parameters or missing sender data product.');
            error.httpStatusCode = 400;
            return Promise.reject(error);
        }

        return template;
    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    name: PLUGIN_NAME,
    endpoints,
    template,
    output,
    response,
};
