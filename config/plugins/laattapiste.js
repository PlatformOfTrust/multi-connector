'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const sftp = require('../../app/protocols/sftp');
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const xml2js = require('xml2js');
const _ = require('lodash');
const fs = require('fs').promises;

const PLUGIN_NAME = 'laattapiste';
const DOWNLOAD_DIR = './temp/';
const orderNumberToCALSId = {};
const productCodeToCALSId = {};

// Source mapping.
const orderConfirmationSchema = {
    properties: {
        data: {
            properties: {
                order: {},
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
                                                'source': 'product.idLocal',
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

    const output = transformer.transform({
        ...input,
        '$': {
            'xsi:noNamespaceSchemaLocation': 'SalesOrderInhouse%20(ID%209326).xsd',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        },
        emptyString: '',
    }, OrderInformationSchema);

    const builder = new xml2js.Builder();
    const xml = builder.buildObject(output);
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
                        const orderNumber = _.get(value, 'idLocal');
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

module.exports = {
    name: PLUGIN_NAME,
    template,
    output,
};
