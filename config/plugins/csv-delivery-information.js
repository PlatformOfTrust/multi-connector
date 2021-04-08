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

const PLUGIN_NAME = 'csv-delivery-information';
const PRIMARY_PRODUCT_CODE = 'C1EC2973-8A0B-4858-BF1E-3A0D0CEFE33A';
const orderNumberToCALSId = {};
const productCodeToCALSId = {};
const orderNumberToCALSInstanceId = {};

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
                            'source': 'purchaseOrderId',
                            'type': 'string',
                            'title': 'Local identifier',
                            'description': 'Locally given identifier.',
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
                                    'source': 'order_numbe',
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
                            'source': 'elements',
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
                                        'source': 'purchaseOrderItemId',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'deliveryRequired': {
                                        '$id': '#/properties/data/properties/order/properties/deliveryRequired',
                                        'source': 'transfer_time',
                                        'type': 'string',
                                        'title': 'Required delivery time',
                                        'description': 'Required delivery time initiated typically by the orderer.',
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
                                                'source': 'orderLineType',
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'idLocal': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/idLocal',
                                                'source': 'purchaseOrderItemId',
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                            },
                                            'name': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/name',
                                                'source': 'element_name',
                                                'type': 'string',
                                                'title': 'Name',
                                                'description': 'Name.',
                                            },
                                            'codeProduct': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/codeProduct',
                                                'source': 'element_guid',
                                                'type': 'string',
                                                'title': 'Product code',
                                                'description': 'Unique product code given by manufacturer.',
                                            },
                                            'assemblyControlNumber': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/assemblyControlNumber',
                                                'source': 'element_acn',
                                                'type': 'string',
                                                'title': 'ACN number',
                                                'description': 'ACN number.',
                                            },
                                            'locationName': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/locationName',
                                                'source': 'building_block_name',
                                                'type': 'string',
                                                'title': 'Location name',
                                                'description': 'Location name.',
                                            },
                                            'groupName': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/groupName',
                                                'source': 'productgroup_name',
                                                'type': 'integer',
                                                'title': 'Product group name',
                                                'description': 'Unique product group name given by manufacturer.',
                                            },
                                            'width': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/width',
                                                'source': 'element_width',
                                                'type': 'integer',
                                                'title': 'Width',
                                                'description': 'Object width.',
                                            },
                                            'height': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/height',
                                                'source': 'element_height',
                                                'type': 'integer',
                                                'title': 'Height',
                                                'description': 'Height.',
                                            },
                                            'length': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/length',
                                                'source': 'element_length',
                                                'type': 'integer',
                                                'title': 'Length',
                                                'description': 'Lenght.',
                                            },
                                            'weight': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/weight',
                                                'source': 'element_weight',
                                                'type': 'number',
                                                'title': 'Weight',
                                                'description': 'Object weight.',
                                            },
                                            'url': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/url',
                                                'source': 'drawing_url',
                                                'type': 'string',
                                                'title': 'URL address',
                                                'description': 'URL address.',
                                            },
                                            'ifcUrl': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/ifcUrl',
                                                'source': 'ifc_url',
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
                                                        'source': 'locationType',
                                                        'type': 'string',
                                                        'title': 'Identity type',
                                                        'description': 'Type of identity.',
                                                    },
                                                    'name': {
                                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/location/properties/name',
                                                        'source': 'factory_name',
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
                                                'source': null,
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

// Source mapping.
const deliveryInformationSchema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/DeliveryInformation?v=2.0',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/DeliveryInformation/?v=2.0',
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
                            'source': 'orderType',
                            'type': 'string',
                            'title': 'Identity type',
                            'description': 'Type of identity.',
                        },
                        'idSystemLocal': {
                            '$id': '#/properties/data/properties/order/properties/idSystemLocal',
                            'type': 'string',
                            'title': 'Source system id',
                            'description': 'Id given by source system.',
                        },
                        'idLocal': {
                            '$id': '#/properties/data/properties/order/properties/idLocal',
                            'source': 'Asiakkaantilausnumero',
                            'type': 'string',
                            'title': 'Local identifier',
                            'description': 'Locally given identifier.',
                        },
                        'categorizationCode': {
                            '$id': '#/properties/data/properties/order/properties/categorizationCode',
                            'source': 'TilaustyyppiID',
                            'type': 'string',
                            'title': 'Category code',
                            'description': 'Code of the categorization class/type.',
                        },
                        'salesOrder': {
                            '$id': '#/properties/data/properties/order/properties/salesOrder',
                            'source': null,
                            'type': 'object',
                            'title': 'Sales order',
                            'description': 'Sales order is the sellers document derived from the buyers order.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/salesOrder/properties/@type',
                                    'source': 'salesOrderType',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idSystemLocal': {
                                    '$id': '#/properties/data/properties/order/properties/salesOrder/properties/idSystemLocal',
                                    'type': 'string',
                                    'title': 'Source system id',
                                    'description': 'Id given by source system.',
                                },
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/salesOrder/properties/idLocal',
                                    'source': 'Tilausnumero',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
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
                                    'source': 'Asiakasnumero',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/customer/properties/name',
                                    'source': 'Asiakas',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                                'idOfficial': {
                                    '$id': '#/properties/data/properties/order/properties/customer/properties/idOfficial',
                                    'source': 'Ytunnus',
                                    'type': 'string',
                                    'title': 'Official identifier',
                                    'description': 'Government (official authority) assigned identifier.',
                                },
                            },
                        },
                        'project': {
                            '$id': '#/properties/data/properties/order/properties/project',
                            'source': null,
                            'type': 'object',
                            'title': 'Project',
                            'description': 'Project (or program) is any undertaking, carried out individually or collaboratively, and that is carefully planned to achieve a particular aim.  Typically a project is long-lasting, combines resouces and contains many processes.',
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
                                    'source': 'Projektinumero',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'name': {
                                    '$id': '#/properties/data/properties/order/properties/project/properties/name',
                                    'source': 'Projekti',
                                    'type': 'string',
                                    'title': 'Name',
                                    'description': 'Name.',
                                },
                            },
                        },
                        'addressDelivery': {
                            '$id': '#/properties/data/properties/order/properties/addressDelivery',
                            'source': null,
                            'type': 'object',
                            'title': 'Delivery address',
                            'description': 'Delivery address.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/addressDelivery/properties/@type',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'streetaddressLine1': {
                                    '$id': '#/properties/data/properties/order/properties/addressDelivery/properties/streetaddressLine1',
                                    'source': 'Toimitusosoite',
                                    'type': 'string',
                                    'title': 'Street Address Line 1',
                                    'description': 'Street Address Line 1.',
                                },
                                'streetaddressLine2': {
                                    '$id': '#/properties/data/properties/order/properties/addressDelivery/properties/streetaddressLine2',
                                    'type': 'string',
                                    'title': 'Street Address Line 2',
                                    'description': 'Street Address Line 2',
                                },
                                'postalArea': {
                                    '$id': '#/properties/data/properties/order/properties/addressDelivery/properties/postalArea',
                                    'type': 'string',
                                    'title': 'Postal Area',
                                    'description': 'Postal Area.',
                                },
                                'postalCode': {
                                    '$id': '#/properties/data/properties/order/properties/addressDelivery/properties/postalCode',
                                    'type': 'string',
                                    'title': 'Postal Code',
                                    'description': 'Postal Code.',
                                },
                                'country': {
                                    '$id': '#/properties/data/properties/order/properties/addressDelivery/properties/country',
                                    'type': 'string',
                                    'title': 'Country',
                                    'description': 'Location country name.',
                                },
                            },
                        },
                        'invoice': {
                            '$id': '#/properties/data/properties/order/properties/invoice',
                            'source': null,
                            'type': 'object',
                            'title': 'Invoice',
                            'description': 'Invoice.',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/invoice/properties/@type',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'idLocal': {
                                    '$id': '#/properties/data/properties/order/properties/invoice/properties/idLocal',
                                    'source': 'Laskunumero',
                                    'type': 'string',
                                    'title': 'Local identifier',
                                    'description': 'Locally given identifier.',
                                },
                                'invoiced': {
                                    '$id': '#/properties/data/properties/order/properties/invoice/properties/invoiced',
                                    'source': 'Laskutus pvm',
                                    'type': 'string',
                                    'title': 'Invoice date',
                                    'description': 'Invoice date.',
                                },
                            },
                        },
                        'deliveryLine': {
                            '$id': '#/properties/data/properties/order/properties/deliveryLine',
                            'type': 'object',
                            'title': 'Delivery Line',
                            'description': 'Delivery Line consist all possible properties typically used in delivery documentation that contain multiple delivery items (products).',
                            'required': [],
                            'properties': {
                                '@type': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/@type',
                                    'type': 'string',
                                    'title': 'Identity type',
                                    'description': 'Type of identity.',
                                },
                                'quantity': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/quantity',
                                    'source': 'Toimitusm��r�',
                                    'type': 'string',
                                    'title': 'Quantity',
                                    'description': 'Quantity of specific objects.',
                                },
                                'unit': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/unit',
                                    'source': 'Yksikk�',
                                    'type': 'string',
                                    'title': 'Unit',
                                    'description': 'Unit used (Defines unit which is used).',
                                },
                                'product': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product',
                                    'type': 'object',
                                    'title': 'Product',
                                    'description': 'A product is an object or system that can be offered to a market to satisfy the desire or need of a customer. When an organisation or person decides to trade, they do so by trading products.  Any object or entity can be made into a product.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'groupName': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/groupName',
                                            'type': 'string',
                                            'title': 'Product group name',
                                            'description': 'Unique product group name given by manufacturer.',
                                        },
                                        'codeProduct': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/codeProduct',
                                            'source': 'Tuotekoodi',
                                            'type': 'string',
                                            'title': 'Product code',
                                            'description': 'Unique product code given by manufacturer.',
                                        },
                                        'codeProduct2': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/codeProduct2',
                                            'type': 'string',
                                            'title': 'Product code 2',
                                            'description': 'Additional unique product code given by manufacturer.',
                                        },
                                        'name': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/name',
                                            'source': 'Myyntinimike',
                                            'type': 'string',
                                            'title': 'Name',
                                            'description': 'Name.',
                                        },
                                        'concrete': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete',
                                            'type': 'object',
                                            'title': 'Concrete',
                                            'description': 'A building material made from a mixture of broken stone or gravel, sand, cement, and water, which can be spread or poured into moulds and forms a mass resembling stone on hardening.',
                                            'required': [],
                                            'properties': {
                                                '@type': {
                                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/@type',
                                                    'type': 'string',
                                                    'title': 'Identity type',
                                                    'description': 'Type of identity.',
                                                },
                                                'categorizationLocal': {
                                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/categorizationLocal',
                                                    'type': 'string',
                                                    'title': 'Local category',
                                                    'description': 'Categorisation name given locally.',
                                                },
                                                'strengthCode': {
                                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/strengthCode',
                                                    'type': 'integer',
                                                    'title': 'Strenght code',
                                                    'description': 'Strenght code.',
                                                },
                                                'sizeGrain': {
                                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/sizeGrain',
                                                    'type': 'string',
                                                    'title': 'Grain size',
                                                    'description': 'Grain size.',
                                                },
                                                'flexibilityCode': {
                                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/flexibilityCode',
                                                    'type': 'string',
                                                    'title': 'Flexibility class',
                                                    'description': 'Flexibility class.',
                                                },
                                                'cement': {
                                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/cement',
                                                    'type': 'object',
                                                    'title': 'Cement',
                                                    'description': 'Cement.',
                                                    'required': [],
                                                    'properties': {
                                                        '@type': {
                                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/cement/properties/@type',
                                                            'type': 'string',
                                                            'title': 'Identity type',
                                                            'description': 'Type of identity.',
                                                        },
                                                        'categorizationLocal': {
                                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/product/properties/concrete/properties/cement/properties/categorizationLocal',
                                                            'type': 'string',
                                                            'title': 'Local category',
                                                            'description': 'Categorisation name given locally.',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                'vehicle': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/vehicle',
                                    'type': 'object',
                                    'title': 'Vehicle',
                                    'description': 'A vehicle is a machine that transports people or cargo. Vehicles include wagons, bicycles, motor vehicles (motorcycles, cars, trucks, buses), railed vehicles (trains, trams), watercraft (ships, boats), amphibious vehicles (screw-propelled vehicle, hovercraft), aircraft (airplanes, helicopters) and spacecraft.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/vehicle/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'idLocal': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/vehicle/properties/idLocal',
                                            'type': 'string',
                                            'title': 'Local identifier',
                                            'description': 'Locally given identifier.',
                                        },
                                        'categorizationCode': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/vehicle/properties/categorizationCode',
                                            'type': 'string',
                                            'title': 'Category code',
                                            'description': 'Code of the categorization class/type.',
                                        },
                                        'categorizationName': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/vehicle/properties/categorizationName',
                                            'type': 'string',
                                            'title': 'Category name',
                                            'description': 'Name of the categorization class/type.',
                                        },
                                    },
                                },
                                'production': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/production',
                                    'type': 'object',
                                    'title': 'Production',
                                    'description': 'Production process.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Production/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'idLocal': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Production/properties/idLocal',
                                            'type': 'string',
                                            'title': 'Local identifier',
                                            'description': 'Locally given identifier.',
                                        },
                                        'locationName': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Production/properties/locationName',
                                            'type': 'string',
                                            'title': 'Location name',
                                            'description': 'Location name.',
                                        },
                                    },
                                },
                                'delivery': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/delivery',
                                    'type': 'object',
                                    'title': 'Delivery',
                                    'description': 'Delivery Process.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Delivery/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'idLocal': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Delivery/properties/idLocal',
                                            'type': 'string',
                                            'title': 'Local identifier',
                                            'description': 'Locally given identifier.',
                                        },
                                        'categorizationLocal': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Delivery/properties/categorizationLocal',
                                            'type': 'string',
                                            'title': 'Local category',
                                            'description': 'Categorisation name given locally.',
                                        },
                                        'startDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Delivery/properties/startDateTime',
                                            'type': 'string',
                                            'title': 'Start time',
                                            'description': 'Start time.',
                                        },
                                        'endDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Delivery/properties/endDateTime',
                                            'type': 'string',
                                            'title': 'End time',
                                            'description': 'End time.',
                                        },
                                        'deliveryPlanned': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Delivery/properties/deliveryPlanned',
                                            'type': 'string',
                                            'title': 'Planned delivery time',
                                            'description': 'Planned delivery time.',
                                        },
                                    },
                                },
                                'loading': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/loading',
                                    'type': 'object',
                                    'title': 'Loading',
                                    'description': 'Loading process.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Loading/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'startDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Loading/properties/startDateTime',
                                            'type': 'string',
                                            'title': 'Start time',
                                            'description': 'Start time.',
                                        },
                                    },
                                },
                                'transportation': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/transportation',
                                    'type': 'object',
                                    'title': 'Transportation',
                                    'description': 'The action of transporting someone or something or the process of being transported.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Transportation/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'startDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Transportation/properties/startDateTime',
                                            'type': 'string',
                                            'title': 'Start time',
                                            'description': 'Start time.',
                                        },
                                        'endDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Transportation/properties/endDateTime',
                                            'type': 'string',
                                            'title': 'End time',
                                            'description': 'End time.',
                                        },
                                    },
                                },
                                'unloading': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/unloading',
                                    'type': 'object',
                                    'title': 'Unloading',
                                    'description': 'Unloading (for example unloading shipment/delivery).',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Unloading/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'startDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Unloading/properties/startDateTime',
                                            'type': 'string',
                                            'title': 'Start time',
                                            'description': 'Start time.',
                                        },
                                    },
                                },
                                'washing': {
                                    '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/washing',
                                    'type': 'object',
                                    'title': 'Washing',
                                    'description': 'Washing.',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Washing/properties/@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'startDateTime': {
                                            '$id': '#/properties/data/properties/order/properties/deliveryLine/properties/Washing/properties/startDateTime',
                                            'type': 'string',
                                            'title': 'Start time',
                                            'description': 'Start time.',
                                        },
                                    },
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

const purchaseOrderIds = {};
const purchaseOrderItemIds = {};

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
        for (let j = 0; j < data.length; j++) {
            let result = {};
            const value = data[j][config.output.value];
            if (Object.keys(config.dataPropertyMappings).includes('DeliveryInformation')) {
                // Detect the need for transformation.
                // TODO: Detect order confirmation.
                if (Object.hasOwnProperty.call(value, 'project')) {
                    // Output has already been transformed.
                    result = {
                        order: {
                            ...value,
                        },
                    };
                } else {
                    // Transform raw input.
                    value.type = 'DeliveryInformation';
                    value.projectType = 'Project';
                    value.locationType = 'Location';

                    // Get CALS purchaseOrderId and purchaseOrderItem from map by ifcGuid.
                    value.purchaseOrderId = purchaseOrderIds[value.element_guid];
                    value.purchaseOrderItemId = purchaseOrderItemIds[value.element_guid];

                    result = transformer.transform(value, deliveryInformationSchema.properties.data);
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
            if (Object.hasOwnProperty.call(object, 'order')) {
                if (!Array.isArray(object.order)) {
                    object.order = [object.order];
                }
                object.order.push(result.order);
            } else {
                object = result;
            }
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

            winston.log('info', 'Received trigger request from ' + (req.get('origin') || req.headers['x-forwarded-for'] || req.socket.remoteAddress));

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
            receiverProductCode = 'purchase-order-from-cals';
            // TODO: Get receiver from config.
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
                    order.deliveryLine = order.deliveryLine.map((l) => {
                        winston.log('info', 'Changed ' + l.product.codeProduct + ' to ' + productCodeToCALSId[l.product.codeProduct]);
                        return {
                            ...l,
                            idLocal: productCodeToCALSId[l.product.codeProduct],
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
        if (Object.hasOwnProperty.call(template.parameters.targetObject, 'sender')) {
            /** Vendor connector */
            winston.log('info', 'Received produced data from '
                + template.parameters.targetObject.sender.productCode
                + ' with vendorId ' + template.parameters.targetObject.vendor.idLocal,
            );
            const id = template.parameters.targetObject.vendor.idLocal;
            const result = cache.getDoc('messages', template.productCode) || {};
            result[id] = template.parameters.targetObject;

            // TODO: Store received order to cache?
            cache.setDoc('messages', template.productCode, result);

            // Stream data to external system.
            try {
                orderNumberToCALSId[result[id].idLocal] = result[id].idSystemLocal;
                for (let i = 0; i < result[id].orderLine.length; i++) {
                    // Store id mappings.
                    productCodeToCALSId[result[id].orderLine[i].product.codeProduct] = result[id].orderLine[i].idSystemLocal;
                }

                console.log('Store CALS identifiers from received order.');
                console.log('orderNumberToCALSId: ' + JSON.stringify(orderNumberToCALSId));
                console.log('productCodeToCALSId: ' + JSON.stringify(productCodeToCALSId));

                /*

                winston.log('info', '3. Send data to URL ' + config.static.url);
                await template.plugins.find(p => p.name === 'streamer')
                    .stream({...template, config}, {data: {order: body}});
                 */

                template.protocol = 'hook';
                template.authConfig.path = id;
                template.generalConfig.hardwareId.dataObjectProperty = 'idLocal';
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

module.exports = {
    name: PLUGIN_NAME,
    endpoints,
    template,
    output,
    response,
};
