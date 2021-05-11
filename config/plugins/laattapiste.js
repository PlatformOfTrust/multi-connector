'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const moment = require('moment');
const xml2js = require('xml2js');

const PLUGIN_NAME = 'laattapiste';
const orderNumberToCALSId = {};
const productCodeToCALSId = {};

// Source mapping.
const orderInformationSchema = {
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
                                    'source': 'idLocal',
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
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyCity': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyZIP': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'BuyerPartyCountryCode': {
                                                    'source': 'emptyString',
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
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'SellerPartyName': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'SellerPartyStreet': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'SellerPartyCity': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'SellerPartyZIP': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'SellerPartyCountryCode': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                        'InvoiceRecipientParty': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'InvoiceRecipientPartyID': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyName': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyStreet': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyCity': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyZIP': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'InvoiceRecipientPartyCountryCode': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                        'DeliveryParty': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'DeliveryPartyID': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyName': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyStreet': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyCity': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyZIP': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                                'DeliveryPartyCountryCode': {
                                                    'source': 'emptyString',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        'Lines': {
                            'source': 'orderLine',
                            'type': 'array',
                            'items': {
                                'source': null,
                                'type': 'object',
                                'properties': {
                                    'text': {
                                        'source': 'lineText',
                                        'type': 'string',
                                    },
                                    'CustomerOrderLineNumber': {
                                        'source': 'emptyString',
                                        'type': 'string',
                                    },
                                    'ItemEAN': {
                                        'source': 'product.idLocal',
                                        'type': 'string',
                                    },
                                    'ItemIDSeller': {
                                        'source': 'emptyString',
                                        'type': 'string',
                                    },
                                    'ItemName': {
                                        'source': 'emptyString',
                                        'type': 'string',
                                    },
                                    'OrderQuantity': {
                                        'source': 'emptyString',
                                        'type': 'string',
                                    },
                                    'OrderUnit': {
                                        'source': 'emptyString',
                                        'type': 'string',
                                    },
                                    'RequestedDeliveryDate': {
                                        'source': 'emptyString',
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
};

const json2xml = (input = {}) => {
    const output = transformer.transform({
        ...input,
        '$': {
            'xsi:noNamespaceSchemaLocation': 'SalesOrderInhouse%20(ID%209326).xsd',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        },
        emptyString: '',
        lineText: 'Line',
    }, orderInformationSchema);

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

                // Pick Kiilto endpoint from config.
                config.static.url = config.static.endpoint;

                // TODO: Send xml order information to Kiilto SFTP server.
                const xml = json2xml(result[id]);
                console.log(xml);

                /*
                winston.log('info', '3. Send data to URL ' + config.static.url);
                await template.plugins.find(p => p.name === 'streamer').stream({...template, config}, {data: {order: brokerResponse}});
                */

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
        for (let j = 0; j < data.length; j++) {
            let result = {};
            const value = data[j][config.output.value];
            if (Object.keys(config.dataPropertyMappings).includes('OrderConfirmation')) {
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

                    // result = transformer.transform(value, orderConfirmationSchema.properties.data);
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
                if (!Array.isArray(result.order)) {
                    result.order = [result.order];
                }
                object.order.push(...result.order);
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
