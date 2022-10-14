'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const validator = require('../../app/lib/validator');
const connector = require('../../app/lib/connector');
const sftp = require('../../app/protocols/sftp');
const router = require('express').Router();
const winston = require('../../logger.js');
const rsa = require('../../app/lib/rsa');
const cron = require('node-cron');
const moment = require('moment');
const cache = require('../../app/cache');
const xml2js = require('xml2js');
const _ = require('lodash');
const fs = require('fs').promises;
const FileType = require('file-type');

const PLUGIN_NAME = 'laattapiste';
const DOWNLOAD_DIR = './temp/';
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
                            'source': 'SalesConfirmations.SalesConfirmation.0.Header.0.CustomerOrderNumber.0',
                            'type': 'string',
                            'title': 'Local identifier',
                            'description': 'Locally given identifier.',
                        },
                        'idSystemLocal': {
                            '$id': '#/properties/data/properties/order/properties/idSystemLocal',
                            'source': 'SalesConfirmations.SalesConfirmation.0.Header.0.SellerOrderNumber.0',
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
                            'source': 'SalesConfirmations.SalesConfirmation.0.Lines.0.Line',
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
                                        'value': 'OrderLine',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/idLocal',
                                        'source': 'CustomerOrderLineNumber.0',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'idSystemLocal': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/idSystemLocal',
                                        'source': 'SellerLineNumber.0',
                                        'type': 'string',
                                        'title': 'Local System identifier',
                                        'description': 'Locally given system identifier.',
                                    },
                                    'deliveryRequired': {
                                        '$id': '#/properties/data/properties/order/properties/deliveryRequired',
                                        'value': '${RequestedDeliveryDate.0}T12:00:00+00:00',
                                        'type': 'string',
                                        'title': 'Required delivery time',
                                        'description': 'Required delivery time initiated typically by the orderer.',
                                    },
                                    'deliveryPlanned': {
                                        '$id': '#/properties/data/properties/order/properties/deliveryPlanned',
                                        'value': '${PromisedDeliveryDate.0}T12:00:00+00:00',
                                        'type': 'string',
                                        'title': 'Planned delivery time',
                                        'description': 'Planned delivery time.',
                                    },
                                    'quantity': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/quantity',
                                        'source': 'ConfirmedQuantity.0',
                                        'type': 'integer',
                                        'title': 'Quantity',
                                        'description': 'Quantity of specific objects.',
                                    },
                                    'unit': {
                                        '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/unit',
                                        'source': 'OrderUnit.0',
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
                                                'value': 'Product',
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
                                                'source': 'ItemEAN.0',
                                                'type': 'string',
                                                'title': 'Local System identifier',
                                                'description': 'Locally given system identifier.',
                                            },
                                            'gtin': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/gtin',
                                                'source': 'ItemEAN.0',
                                                'type': 'string',
                                                'title': 'Local System identifier',
                                                'description': 'Locally given system identifier.',
                                            },
                                            'name': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/name',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Name',
                                                'description': 'Name.',
                                            },
                                            'descriptionGeneral': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/descriptionGeneral',
                                                'source': 'ItemName.0',
                                                'type': 'string',
                                                'title': 'Description',
                                                'description': 'Description.',
                                            },
                                            'codeProduct': {
                                                '$id': '#/properties/data/properties/order/properties/orderLine/items/properties/product/properties/codeProduct',
                                                'source': 'ItemIDSeller.0',
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

const OrderInformationSchema = {
    'source': null,
    'type': 'object',
    'properties': {
        'SalesOrders': {
            'source': null,
            'type': 'object',
            'properties': {
                '$': {
                    'source': 'idLocal',
                    'type': 'object',
                    'properties': {
                        'xsi:noNamespaceSchemaLocation': {
                            'source': '$.xsi:noNamespaceSchemaLocation',
                            'type': 'string',
                        },
                        'xmlns:xsi': {
                            'source': '$.xmlns:xsi',
                            'type': 'string',
                        },
                    },
                },
                'SalesOrder': {
                    'source': null,
                    'type': 'object',
                    'properties': {
                        'Header': {
                            'source': null,
                            'type': 'object',
                            'properties': {
                                'CustomerOrderNumber': {
                                    'source': 'idLocal',
                                    'type': 'string',
                                },
                                'OrderDate': {
                                    'source': 'ordered',
                                    'type': 'string',
                                },
                                'RequestedDeliveryDate': {
                                    'source': 'deliveryRequired',
                                    'type': 'string',
                                },
                                'CustomerReference': {
                                    'source': 'reference',
                                    'type': 'string',
                                },
                                'CustomerContractNumber': {
                                    'source': 'project.idLocal',
                                    'type': 'string',
                                },
                                'FreeText': {
                                    'source': 'descriptionGeneral',
                                    'type': 'string',
                                },
                                'Attributes': {
                                    'source': null,
                                    'type': 'object',
                                    'properties': {
                                        'Attribute': {
                                            'source': 'attributes',
                                            'type': 'array',
                                            'items': {
                                                'source': null,
                                                'type': 'object',
                                                'properties': {
                                                    '$': {
                                                        'source': null,
                                                        'type': 'object',
                                                        'properties': {
                                                            'name': {
                                                                'source': 'name',
                                                                'type': 'string',
                                                            },
                                                        },
                                                    },
                                                    '_': {
                                                        'source': 'value',
                                                        'type': 'string',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                'Parties': {
                                    'source': null,
                                    'type': 'object',
                                    'properties': {
                                        'BuyerParty': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'BuyerPartyID': {
                                                    'source': 'customer.idOfficial',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyName': {
                                                    'source': 'customer.name',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyName2': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyStreet': {
                                                    'source': 'customer.contactInformation.streetAddressLine1',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyCity': {
                                                    'source': 'customer.contactInformation.postalArea',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyZIP': {
                                                    'source': 'customer.contactInformation.postalCode',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyCountryCode': {
                                                    'source': 'customer.contactInformation.country',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyContact': {
                                                    'source': null,
                                                    'type': 'object',
                                                    'properties': {
                                                        'BuyerPartyContactName': {
                                                            'source': 'contact.name',
                                                            'type': 'string',
                                                        },
                                                        'BuyerPartyContactPhone': {
                                                            'source': 'contact.contactInformation.phoneNumber',
                                                            'type': 'string',
                                                        },
                                                        'BuyerPartyContactEmail': {
                                                            'source': 'contact.contactInformation.addressEmail',
                                                            'type': 'string',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        'SellerParty': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'SellerPartyID': {
                                                    'source': 'vendor.idOfficial',
                                                    'type': 'string',
                                                },
                                                'SellerPartyName': {
                                                    'source': 'vendor.name',
                                                    'type': 'string',
                                                },
                                                'SellerPartyStreet': {
                                                    'source': 'vendor.contactInformation.streetAddressLine1',
                                                    'type': 'string',
                                                },
                                                'SellerPartyCity': {
                                                    'source': 'vendor.contactInformation.postalArea',
                                                    'type': 'string',
                                                },
                                                'SellerPartyZIP': {
                                                    'source': 'vendor.contactInformation.postalCode',
                                                    'type': 'string',
                                                },
                                                'SellerPartyCountryCode': {
                                                    'source': 'vendor.contactInformation.country',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                        'InvoiceRecipientParty': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'InvoiceRecipientPartyID': {
                                                    'source': 'addressBilling.idLocal',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyName': {
                                                    'source': 'addressBilling.name',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyStreet': {
                                                    'source': 'addressBilling.streetAddressLine1',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyCity': {
                                                    'source': 'addressBilling.postalArea',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyZIP': {
                                                    'source': 'addressBilling.postalCode',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyCountryCode': {
                                                    'source': 'addressBilling.country',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                        'DeliveryParty': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'DeliveryPartyID': {
                                                    'source': 'addressShipping.idLocal',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyName': {
                                                    'source': 'addressShipping.name',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyStreet': {
                                                    'source': 'addressShipping.streetAddressLine1',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyCity': {
                                                    'source': 'addressShipping.postalArea',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyZIP': {
                                                    'source': 'addressShipping.postalCode',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyCountryCode': {
                                                    'source': 'addressShipping.country',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        'Lines': {
                            'source': null,
                            'type': 'object',
                            'properties': {
                                'Line': {
                                    'source': 'orderLine',
                                    'type': 'array',
                                    'items': {
                                        'source': null,
                                        'type': 'object',
                                        'properties': {
                                            'CustomerOrderLineNumber': {
                                                'source': 'idLocal',
                                                'type': 'string',
                                            },
                                            'ItemEAN': {
                                                'source': 'product.gtin',
                                                'type': 'string',
                                            },
                                            'ItemIDSeller': {
                                                'source': 'product.codeProduct',
                                                'type': 'string',
                                            },
                                            'ItemName': {
                                                'source': 'product.descriptionGeneral',
                                                'type': 'string',
                                            },
                                            'OrderQuantity': {
                                                'source': 'quantity',
                                                'type': 'string',
                                            },
                                            'OrderUnit': {
                                                'source': 'unit',
                                                'type': 'string',
                                            },
                                            'RequestedDeliveryDate': {
                                                'source': 'deliveryRequired',
                                                'type': 'string',
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

const json2xml = (input = {}) => {
    input.addressShipping.idLocal = input.addressShipping.idLocal || '';
    input.addressBilling.idLocal = input.addressBilling.idLocal || '';
    input.vendor.idOfficial = input.vendor.idOfficial || '';
    input.customer.contactInformation = input.customer.contactInformation || {};
    input.customer.contactInformation.streetAddressLine1 = input.customer.contactInformation.streetAddressLine1 || '';
    input.customer.contactInformation.postalCode = input.customer.contactInformation.postalCode || '';
    input.customer.contactInformation.postalArea = input.customer.contactInformation.postalArea || '';
    input.customer.contactInformation.country = input.customer.contactInformation.country || '';
    input.attributes = [
        {name: 'purchaseOrderQRC', value: _.get(input, 'codeQr')},
        {name: 'workPackage', value: _.get(input, 'addressShipping.process.idLocal')},
        {name: 'workPackageLocation', value: _.get(input, 'addressShipping.nameArea')},
        {name: 'workPackageLocationName', value: _.get(input, 'addressShipping.location.name')},
        {name: 'workPackageAreaName', value: _.get(input, 'addressShipping.location.zone')},
        {name: 'workPackageInventoryLocationName', value: _.get(input, 'addressShipping.location.space')},
        {name: 'workPackagePhase', value: _.get(input, 'addressShipping.process.name')},
        {name: 'workPackageOperator', value: _.get(input, 'addressShipping.contact.name')},
        {name: 'workPackageOperatorContactName', value: _.get(input, 'addressShipping.contact.contactInformation.name')},
        {name: 'workPackageOperatorContactTelephone', value: _.get(input, 'addressShipping.contact.contactInformation.phoneNumber')},
    ];

    // Compose reference.
    if (input.reference === '') {
        input.reference = [
            _.get(input, 'addressShipping.process.idLocal'),
            _.get(input, 'addressShipping.location.zone.name'),
            _.get(input, 'addressShipping.location.space.name'),
        ].join(' / ');
    }

    let output;
    let xml;
    try {
        output = transformer.transform({
            ...input,
            '$': {
                'xsi:noNamespaceSchemaLocation': 'SalesOrderInhouse%20(ID%209326).xsd',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            },
            emptyString: '',
        }, OrderInformationSchema);
        const builder = new xml2js.Builder();
        xml = builder.buildObject(output);
    } catch (err) {
        return err;
    }

    return xml;
};

/**
 * Switch querying protocol to SFTP.
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

            cache.setDoc('messages', template.productCode, result);

            // Stream data to external system.
            try {
                result[id].idLocal = result[id].idLocal || 'Unknown';
                result[id].idSystemLocal = result[id].idSystemLocal || 'Unknown';
                orderNumberToCALSId[result[id].idLocal] = result[id].idSystemLocal;

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

                // Pick Laattapiste endpoint from config.
                config.static.url = config.static.endpoint;

                const xml = json2xml(result[id]);
                if (xml instanceof Error) {
                    xml.message = 'Failed to write XML file with error "' + xml.message + '"';
                    return Promise.reject(xml);
                }

                const path = '/' + result[id].idSystemLocal + '.xml';
                const to = DOWNLOAD_DIR + template.productCode + (template.authConfig.fromPath || '/from') + path;
                await sftp.checkDir(to);
                await fs.writeFile(to, xml);

                winston.log('info', '3. Send data to URL ' + to);
                await sftp.sendData(template, [path]);

                template.protocol = 'hook';
                template.authConfig.path = id;
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
                        const orderNumber = _.get(value, 'SalesConfirmations.SalesConfirmation.0.Header.0.CustomerOrderNumber.0');
                        value.idSystemLocal = orderNumberToCALSId[orderNumber];

                        if (!Object.hasOwnProperty.call(productCodeToCALSId, value.idSystemLocal)) {
                            productCodeToCALSId[value.idSystemLocal] = {};
                        }
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

// Cron tasks.
const tasks = {};
const DEFAULT_SCHEDULE = '*/30 * * * *';
const DEFAULT_TIMEZONE = 'Europe/Helsinki';

/**
 * Composes local connector request.
 *
 * @param {String} productCode
 * @param {Object} config
 * @param {String} idLocal
 * @return
 *   The connector response.
 */
const getData = async (productCode, config, idLocal) => {
    // Compose triggered local connector request.
    const triggeredReq = {
        body: {
            productCode,
            timestamp: moment().format(),
            parameters: {
                targetObject: {
                    idLocal,
                },
            },
        },
        connectorUrl: config.connectorUrl,
        publicKeyUrl: config.publicKeyUrl,
    };
    winston.log('info', '1. Query self with path ${targetObject.idLocal} as ' + idLocal);
    return await connector.getData(triggeredReq);
};

/**
 * Local handler to send error response.
 *
 * @param {Object} [req]
 * @param {Object} [res]
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
    if (req && res) {
        return res.status(err.httpStatusCode || 500).send(result);
    } else {
        return result;
    }
};

/**
 * Sends triggered broker request.
 *
 * @param {Object} [req]
 * @param {Object} [res]
 * @param {String} productCode
 * @param {Object} config
 * @param {Object} template
 * @param {Object} result
 * @param {Object} options
 */
const sendData = async (req, res, productCode, config, template, result, options) => {
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
        template = await connector.resolvePlugins(template);
        template.config = config;

        const keys = Object.keys(result.output.data);

        if (keys.length === 0) {
            const noData = new Error();
            noData.httpStatusCode = 404;
            noData.message = 'Not found.';
            return errorResponse(req, res, noData);
        }

        const key = keys[0];
        template.output.array = key;

        try {
            if (!Array.isArray(result.output.data[keys[0]])) {
                result.output.data[key] = [result.output.data[key]];
            }
            // Resolve ids.
            result.output.data[key].map((order) => {
                if (!Object.hasOwnProperty.call(order, 'deliveryLine')) {
                    return order;
                }
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
            if (result.output.data[key].length === 1) {
                result.output.data[key] = result.output.data[key][0];
                if (Array.isArray(result.output.data[key])) {
                    if (result.output.data[key].length === 1) {
                        result.output.data[key] = result.output.data[key][0];
                    }
                }
            }
        } catch (e) {
            console.log(e.message);
        }

        if (template.plugins.find(p => p.name === 'broker') && template.config.plugins.broker) {
            // Set isTest.
            template.config.plugins.broker.parameters = {
                isTest: options.isTest,
            };

            /** Sender data product */
            template.config.productCode = productCode;

            // Check for mapped receiver.
            if (_.isObject(receiverProductCode)) {
                if (Object.hasOwnProperty.call(receiverProductCode, key)) {
                    receiverProductCode = receiverProductCode[key];
                }
            }

            /** Receiver data product */
            config.static.productCode = receiverProductCode;

            winston.log('info', '2. Send received data to receiver data product ' + config.static.productCode + ', isTest=' + options.isTest);
            await template.plugins.find(p => p.name === 'broker').stream(template, result.output);
        }
    } catch (err) {
        winston.log('error', err.message);
        return errorResponse(req, res, err);
    }

    // Detect if order confirmation was sent.
    try {
        if (Object.hasOwnProperty.call(result.output, 'data')) {
            if (Object.hasOwnProperty.call(result.output.data, 'order')) {
                if (Object.hasOwnProperty.call(result.output.data.order, 'orderLine')) {
                    const filename = options.filename;
                    const logFilename = options.filename.slice(0, -4) + '.log';
                    const dirs = Array.isArray(config.static.toPath) ? config.static.toPath : [config.static.toPath];
                    for (let i = 0; i < dirs.length; i++) {
                        let removed = false;
                        try {
                            const items = await sftp.remove({
                                productCode: config.productCode,
                                authConfig: {...config.static, toPath: dirs[i]},
                            }, [filename, logFilename], config.productCode);
                            if (items.length > 0) {
                                removed = true;
                                winston.log('info', items.toString());
                            }
                        } catch (err) {
                            winston.log('error', err.message);
                            removed = false;
                        }
                        if (removed) {
                            break;
                        }
                    }
                }
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
    return {
        message: 'ok',
    };
};

/**
 * Endpoint to trigger order/delivery confirmation sending to CALS.
 *
 * @param {Object} req
 * @param {Object} res
 * @return
 *   The translator data.
 */
const controller = async (req, res) => {
    let result;
    // let host;
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
            config.connectorUrl = req.connectorUrl;
            config.publicKeyUrl = req.publicKeyUrl;
        } catch (err) {
            err.httpStatusCode = 500;
            err.message = 'Failed to handle request.';
            return errorResponse(req, res, err);
        }

        // 2. Get new data from vendor with parameters provided in the body.
        try {
            result = await getData(productCode, config, req.body.filename);
        } catch (err) {
            winston.log('error', err.message);
            return errorResponse(req, res, err);
        }

        // 3. Parse receiver productCode from received confirmation and send broker request to produce confirmation.
        const options = {
            filename: req.body.filename,
            isTest: req.body.is_test,
        };
        await sendData(req, res, productCode, config, template, result, options);

        // 5. Send signed data response.
        const created = moment().format();
        res.status(200).send({
            ...(result.output || {}),
            signature: {
                type: 'RsaSignature2018',
                created,
                creator: config.publicKeyUrl,
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
 * Executes scheduled task.
 *
 * @param {String} productCode
 */
const runJob = async (productCode) => {
    try {
        const config = cache.getDoc('configs', productCode);
        // Download files.
        const docs = (await sftp.getData({
            productCode,
            plugins: [],
            authConfig: config.static,
            parameters: {targetObject: {}},
        }, [''], true)).filter(doc => ((doc || {}).path || '').slice(-4) !== '.log');

        // Send new files and move to archive.
        for (let i = 0; i < docs.length; i++) {
            const d = docs[i];
            winston.log('info', 'Send file ' + d.path);

            // 2. Trigger file sending to receivers.
            try {
                const parts = d.path.split('/');
                const result = await getData(productCode, config, parts[parts.length - 1]);
                const options = {
                    filename: parts[parts.length - 1],
                    isTest: false,
                };
                const template = cache.getDoc('templates', config.template) || {};
                const send = await sendData(null, null, productCode, config, template, result, options);
                if (Object.hasOwnProperty.call(send, 'error')) {
                    const lineLimit = 10;
                    const filename = `${options.filename.split('.').slice(0, -1).join('.')}.log`;
                    const path = `/${filename}`;
                    const logFilePath = parts.slice(0, -1).join('/');

                    // Get log.
                    const logs = await sftp.getData({
                        productCode,
                        plugins: [],
                        authConfig: {...config.static, toPath: logFilePath},
                        parameters: {targetObject: {}},
                    }, [path], true);

                    // Insert new line.
                    let log = '';
                    const file = logs.find(f => f.name === filename);
                    if (file) {
                        log = Buffer.from(file.data, 'base64').toString('utf-8') + '\n';
                    }
                    log += new Date().toISOString() + ': ' + parts[parts.length - 1] + ', ' + JSON.stringify(send.error);
                    const content = log.split('\n').slice(-lineLimit).join('\n');

                    // Upload log.
                    const to = DOWNLOAD_DIR + productCode + logFilePath + path;
                    await sftp.checkDir(to);
                    await fs.writeFile(to, content);
                    await sftp.sendData({
                        productCode,
                        plugins: [],
                        authConfig: {...config.static, fromPath: logFilePath},
                        parameters: {targetObject: {}},
                    }, [path]);
                }
            } catch (err) {
                winston.log('error', err.message);
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Restarts a cron task by product code.
 *
 * @param {String} productCode
 * @param {String} [schedule]
 * @param {String} [timezone]
 */
const restartTask = (productCode, schedule = DEFAULT_SCHEDULE, timezone = DEFAULT_TIMEZONE) => {
    try {
        stopTask(productCode);
        destroyTask(productCode);
        return startTask(productCode, schedule, timezone);
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Starts a cron task by product code.
 *
 * @param {String} productCode
 * @param {String} [schedule]
 * @param {String} [timezone]
 */
const startTask = async (productCode, schedule = DEFAULT_SCHEDULE, timezone = 'Europe/Helsinki') => {
    try {
        winston.log('info', `Start a job with product code ${productCode} and schedule ${schedule} at ${timezone} timezone`);
        tasks[productCode] = cron.schedule(schedule, () => {
            runJob(productCode);
        }, {
            scheduled: true,
            timezone,
        });
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Stops a cron task by product code.
 *
 * @param {String} productCode
 */
const stopTask = (productCode) => {
    try {
        if (Object.hasOwnProperty.call(tasks, productCode)) {
            if (Object.hasOwnProperty.call(tasks[productCode], 'stop')) {
                tasks[productCode].stop();
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Destroys a cron task by product code.
 *
 * @param {String} productCode
 */
const destroyTask = (productCode) => {
    try {
        if (Object.hasOwnProperty.call(tasks, productCode)) {
            if (Object.hasOwnProperty.call(tasks[productCode], 'destroy')) {
                tasks[productCode].destroy();
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

// Get related configs and set schedules.
setTimeout(() => {
    Object.entries(cache.getKeysAndDocs('configs') || [])
        .filter(([_key, value]) => Object.entries(value.plugins || {})
            .filter(([key, _value]) => key === PLUGIN_NAME).length > 0)
        .forEach(([productCode, config]) => {
            if (Object.hasOwnProperty.call(config.plugins[PLUGIN_NAME], 'schedule')) {
                const schedule = config.plugins[PLUGIN_NAME].schedule;
                if (cron.validate(schedule)) {
                    restartTask(productCode, schedule, config.plugins[PLUGIN_NAME].timezone);
                } else {
                    winston.log('error', 'Invalid cron expression.');
                }
            }
        });
}, 5000);

/**
 * Detect JSON data.
 *
 * @param {String} data
 * @return {Boolean}
 */
const isJSON = (data) => {
    try {
        return !!JSON.parse(data);
    } catch (e) {
        return false;
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
        if (typeof response.data === 'string' || response.data instanceof String) {
            const fileType = await FileType.fromBuffer(Buffer.from(response.data, 'base64'));
            if (!fileType) {
                const json = Buffer.from(response.data, 'base64').toString('utf-8');
                // File is not a binary-based file format.
                if (isJSON(json)) {
                    // File is .json
                    response.data = JSON.parse(json);
                } else {
                    // File is .txt, .csv, .svg, etc.
                    response = {
                        data: Buffer.from(response.data, 'base64').toString('utf-8'),
                    };
                }
            } else if ((fileType || {}).ext === 'xml') {
                response = {
                    data: await xml2js.parseStringPromise(Buffer.from(response.data, 'base64').toString('utf-8')),
                };
            } else {
                response = {
                    data: {
                        filename: response.id,
                        content: response.data,
                        extension: fileType.ext,
                        mimetype: fileType.mime,
                        encoding: 'base64',
                    },
                };
            }
        } else {
            response = {data: response};
        }
        return response;
    } catch (e) {
        console.log(e.message);
        return response;
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

module.exports = {
    name: PLUGIN_NAME,
    endpoints,
    template,
    response,
    output,
};
