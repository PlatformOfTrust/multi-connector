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
                        /** TODO: Missing idLocal? */
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
                                        'source': 'purchaseOrderItemId',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
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
                            'source': 'purchaseOrderId',
                            'type': 'string',
                            'title': 'Local identifier',
                            'description': 'Locally given identifier.',
                        },
                        /** TODO: Should this be an array? */
                        'orderLine': {
                            '$id': '#/properties/data/properties/order/properties/orderLine',
                            'type': 'object',
                            'title': 'Order line',
                            'description': 'Order line.',
                            'required': [],
                            'properties': {
                                'product': {
                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/product',
                                    'source': 'purchaseOrderItems',
                                    'type': 'object',
                                    'title': 'Product',
                                    'description': 'Product.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/@type',
                                            'source': 'orderLineType',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'idLocal': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/idLocal',
                                            'source': 'purchaseOrderItemId',
                                            'type': 'string',
                                            'title': 'Local identifier',
                                            'description': 'Locally given identifier.',
                                        },
                                        'name': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/name',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Name',
                                            'description': 'Name.',
                                        },
                                        'codeProduct': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/codeProduct',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Product code',
                                            'description': 'Unique product code given by manufacturer.',
                                        },
                                        'assemblyControlNumber': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/assemblyControlNumber',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'ACN number',
                                            'description': 'ACN number.',
                                        },
                                        'locationName': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/locationName',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Location name',
                                            'description': 'Location name.',
                                        },
                                        'groupName': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/groupName',
                                            'source': null,
                                            'type': 'integer',
                                            'title': 'Product group name',
                                            'description': 'Unique product group name given by manufacturer.',
                                        },
                                        'width': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/width',
                                            'source': null,
                                            'type': 'integer',
                                            'title': 'Width',
                                            'description': 'Object width.',
                                        },
                                        'height': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/height',
                                            'source': null,
                                            'type': 'integer',
                                            'title': 'Height',
                                            'description': 'Height.',
                                        },
                                        'length': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/length',
                                            'source': null,
                                            'type': 'integer',
                                            'title': 'Length',
                                            'description': 'Lenght.',
                                        },
                                        'weight': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/weight',
                                            'source': null,
                                            'type': 'number',
                                            'title': 'Weight',
                                            'description': 'Object weight.',
                                        },
                                        'url': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/url',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'URL address',
                                            'description': 'URL address.',
                                        },
                                        'ifcUrl': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/ifcUrl',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'IfcUrl',
                                            'description': 'IfcUrl.',
                                        },
                                        'location': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/location',
                                            'source': null,
                                            'type': 'object',
                                            'title': 'Location',
                                            'description': 'Location.',
                                            'required': [],
                                            'properties': {
                                                '@type': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/location/properties/@type',
                                                    'source': null,
                                                    'type': 'string',
                                                    'title': 'Identity type',
                                                    'description': 'Type of identity.',
                                                },
                                                'name': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/product/properties/location/properties/name',
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
                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction',
                                    'source': null,
                                    'type': 'object',
                                    'title': 'Process Production',
                                    'description': 'Process Production.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'production': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction/properties/production',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Production time',
                                            'description': 'Production time.',
                                        },
                                        'carbonDioxide': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction/properties/carbonDioxide',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Carbon dioxide level',
                                            'description': 'Carbon dioxide level.',
                                        },
                                        'location': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction/properties/location',
                                            'source': null,
                                            'type': 'object',
                                            'title': 'Location',
                                            'description': 'Location.',
                                            'required': [],
                                            'properties': {
                                                '@type': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction/properties/location/properties/@type',
                                                    'source': null,
                                                    'type': 'string',
                                                    'title': 'Identity type',
                                                    'description': 'Type of identity.',
                                                },
                                                'name': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processProduction/properties/location/properties/name',
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
                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processDelivery',
                                    'source': null,
                                    'type': 'object',
                                    'title': 'Process Delivery',
                                    'description': 'Process Delivery.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processDelivery/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'carbonDioxide': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processDelivery/properties/carbonDioxide',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Carbon dioxide level',
                                            'description': 'Carbon dioxide level.',
                                        },
                                        'deliveryPlanned': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processDelivery/properties/deliveryPlanned',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Planned delivery time',
                                            'description': 'Planned delivery time.',
                                        },
                                        'deliveryActual': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processDelivery/properties/deliveryActual',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Actual delivery time',
                                            'description': 'Actual delivery time.',
                                        },
                                        'deliveryRequired': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processDelivery/properties/deliveryRequired',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Required delivery time',
                                            'description': 'Required delivery time initiated typically by the orderer.',
                                        },
                                    },
                                },
                                'processInstallation': {
                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processInstallation',
                                    'source': null,
                                    'type': 'object',
                                    'title': 'Process Installation',
                                    'description': 'Process Installation.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processInstallation/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'installationPlanned': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processInstallation/properties/installationPlanned',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Planned installation time',
                                            'description': 'Planned installation time.',
                                        },
                                        'installationActual': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processInstallation/properties/installationActual',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Installation Actual',
                                            'description': 'Installation Actual.',
                                        },
                                    },
                                },
                                'processLoading': {
                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading',
                                    'source': null,
                                    'type': 'object',
                                    'title': 'Process Loading',
                                    'description': 'Process Loading.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'idLocal': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading/properties/idLocal',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Local identifier',
                                            'description': 'Locally given identifier.',
                                        },
                                        'status': {
                                            '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading/properties/status',
                                            'source': null,
                                            'type': 'object',
                                            'title': 'Life-cycle status',
                                            'description': 'Life-cycle status.',
                                            'required': [],
                                            'properties': {
                                                '@type': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading/properties/status/properties/@type',
                                                    'source': null,
                                                    'type': 'string',
                                                    'title': 'Identity type',
                                                    'description': 'Type of identity.',
                                                },
                                                'name': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading/properties/status/properties/name',
                                                    'source': null,
                                                    'type': 'string',
                                                    'title': 'Name',
                                                    'description': 'Name.',
                                                },
                                                'statusCode': {
                                                    '$id': '#/properties/data/properties/order/properties/orderLine/properties/processLoading/properties/status/properties/statusCode',
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
                // TODO: Detect order confirmation.
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
                    value.descriptionGeneral = 'Purchase order information.';
                    value.requiredDeliveryDateTime = new Date(value.requiredDeliveryDate + 'T' + value.requiredDeliveryTime).toISOString();
                    value.purchaseOrderItems = value.purchaseOrderItems.map((i) => {return {orderLineType: 'OrderLine', productType: 'Product', ...i};});
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
            winston.log('info', 'Fetch from cache ' + config.productCode);
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
            instanceId: {
                required: true,
            },
            entityId: {
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
            productCode = parts.splice(parts.indexOf('c4-cals') + 1)[0];
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

            template = cache.getDoc('templates', config.template) || {};
            host = req.get('host').split(':')[0];
            config.connectorURL = (host === 'localhost' || net.isIP(host) ? 'http' : 'https') + '://' + req.get('host');
        } catch (err) {
            err.httpStatusCode = 500;
            err.message = 'Failed to handle request.';
            return errorResponse(req, res, err);
        }

        // 2. Get new data from CALS with parameters provided in the body.
        try {
            // Parse instance and entity id from request body.
            const instanceId = req.body.instanceId;
            const idLocal = req.body.entityId;
            // Compose triggered local connector request.
            const triggeredReq = {
                body: {
                    productCode,
                    'timestamp': moment().format(),
                    'parameters': {
                        instanceId,
                        'targetObject': {
                            'order': {
                                idLocal,
                            },
                        },
                    },
                },
                protocol: 'http',
                get: function () {
                    return config.connectorURL;
                },
            };
            winston.log('info', '1. Query self with REST path /instances/${instanceId}/purchaseorders/${purchaseOrderId}');
            result = await connector.getData(triggeredReq);
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
            winston.log('error', 'Could not parse vendor external id from CALS response.');
        }

        // 4. Send data to vendor data product with broker plugin.
        try {
            /** Sender data product */
            config.productCode = productCode;
            /** Receiver data product */
            config.static.productCode = vendorProductCode;

            template = await connector.resolvePlugins(template);
            template.config = config;
            winston.log('info', '2. Send data to vendor data product: ' + vendorProductCode);
            await template.plugins.find(p => p.name === 'broker').stream(template, result.output);
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
            winston.log('info', 'Connector consumes cache by vendorId.');
            template.authConfig.path = [template.parameters.targetObject.vendor.idLocal];
        } else if (Object.hasOwnProperty.call(template.parameters.targetObject, 'order')) {
            /** CALS connector */
            winston.log('info', 'Connector consumes CALS REST API by orderId.');
            template.protocol = 'rest';
            template.authConfig.path = '/instances/' + template.authConfig.instance + '/purchaseorders/' + template.authConfig.path;
        }

        // TODO: Come up with a better way to detect that the received data is meant to be produced and not consumed.
        if (Object.hasOwnProperty.call(template.parameters.targetObject, '@type')) {
            /** Vendor connector */
            winston.log('info', 'Store received data to cache by vendorId: ' + template.parameters.targetObject.vendor.idLocal);
            const id = template.parameters.targetObject.vendor.idLocal;
            const result = cache.getDoc('messages', template.productCode) || {};
            result[id] = template.parameters.targetObject;
            cache.setDoc('messages', template.productCode, result);
            // Stream data to external system.
            try {
                await template.plugins.find(p => p.name === 'streamer')
                    .stream({...template, config}, {data: {order: result[id]}});
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return template;
    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    name: 'c4-cals',
    endpoints,
    template,
    output,
    response,
};
