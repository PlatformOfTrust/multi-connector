'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const connector = require('../../app/lib/connector');
const sftp = require('../../app/protocols/sftp');
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const cron = require('node-cron');
const moment = require('moment');
const xml2js = require('xml2js');
const _ = require('lodash');
const fs = require('fs').promises;

const PLUGIN_NAME = 'stark';
const DOWNLOAD_DIR = './temp/';
const orderNumberToCALSId = {};
const productCodeToCALSId = {};

// Cron tasks.
const tasks = {};
const DEFAULT_SCHEDULE = '*/30 * * * *';
const DEFAULT_TIMEZONE = 'Europe/Helsinki';

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
        'Batch': {
            'source': null,
            'type': 'object',
            'properties': {
                '$': {
                    'source': null,
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
                'Control': {
                    'source': null,
                    'type': 'object',
                    'properties': {
                        'C_Msg_OriginalID': {
                            'source': 'timestamp',
                            'type': 'string',
                        },
                        'C_Msg_Sender': {
                            'source': 'customer.id',
                            'type': 'string',
                        },
                        'C_Msg_Receiver': {
                            'source': 'vendor.id',
                            'type': 'string',
                        },
                        'C_Msg_Type': {
                            'source': 'externalMessageType',
                            'type': 'string',
                        },
                        'C_VersionTCXML': {
                            'source': 'externalVersionType',
                            'type': 'string',
                        },
                    },
                },
                'Msg': {
                    'source': '',
                    'type': 'array',
                    'items': {
                        'source': null,
                        'type': 'object',
                        'properties': {
                            'Control': {
                                'source': null,
                                'type': 'object',
                                'properties': {
                                    'C_Msg_Sender': {
                                        'source': 'customer.id',
                                        'type': 'string',
                                    },
                                    'C_Msg_Receiver': {
                                        'source': 'vendor.id',
                                        'type': 'string',
                                    },
                                    'C_Msg_Type': {
                                        'source': 'externalMessageType',
                                        'type': 'string',
                                    },
                                    'C_VersionTCXML': {
                                        'source': 'externalVersionType',
                                        'type': 'string',
                                    },
                                },
                            },
                            'Hdr': {
                                'source': null,
                                'type': 'object',
                                'properties': {
                                    'H_DocType_Code': {
                                        'source': 'externalDocType',
                                        'type': 'string',
                                    },
                                    'H_DocNumber_ID': {
                                        'source': 'idLocal',
                                        'type': 'string',
                                    },
                                    'H_Date_Order': {
                                        'source': 'dateOrdered',
                                        'type': 'string',
                                    },
                                    'H_Time_Order': {
                                        'source': 'timeOrdered',
                                        'type': 'string',
                                    },
                                    'H_Date_Order_Delivery': {
                                        'source': 'dateOrderDelivery',
                                        'type': 'string',
                                    },
                                    'H_Time_Order_Delivery': {
                                        'source': 'timeOrderDelivery',
                                        'type': 'string',
                                    },
                                    'H_Freetext_Gen': {
                                        'source': 'descriptionGeneral',
                                        'type': 'string',
                                    },
                                    'H_Ref_CustNum': {
                                        'source': 'customer.ifOfficial',
                                        'type': 'string',
                                    },
                                    'H_Ref_VendorNum': {
                                        'source': 'vendor.idLocal',
                                        'type': 'string',
                                    },
                                    'H_Ref_ProjNum': {
                                        'source': 'project.idLocal',
                                        'type': 'string',
                                    },
                                    'H_Ref_OrderNum': {
                                        'source': 'idLocal',
                                        'type': 'string',
                                    },
                                    'H_Ref_Ship_ID': {
                                        'source': 'codeQr',
                                        'type': 'string',
                                    },
                                    'H_BuyerParty': {
                                        'source': null,
                                        'type': 'object',
                                        'properties': {
                                            'ID_Code': {
                                                'source': 'externalIdTypeBuyer',
                                                'type': 'string',
                                            },
                                            'ID': {
                                                'source': 'customer.id',
                                                'type': 'string',
                                            },
                                            'Name': {
                                                'source': 'customer.name',
                                                'type': 'string',
                                            },
                                            'Street': {
                                                'source': 'addressBilling.streetAddressLine1',
                                                'type': 'string',
                                            },
                                            'Zip': {
                                                'source': 'addressBilling.postalCode',
                                                'type': 'string',
                                            },
                                            'City': {
                                                'source': 'addressBilling.postalArea',
                                                'type': 'string',
                                            },
                                            'Country_Name': {
                                                'source': 'addressBilling.country',
                                                'type': 'string',
                                            },
                                            'Country_Code': {
                                                'source': 'addressBilling.countryCode',
                                                'type': 'string',
                                            },
                                            'Email': {
                                                'source': 'contact.contactInformation.addressEmail',
                                                'type': 'string',
                                            },
                                            'Phone': {
                                                'source': 'contact.contactInformation.phoneNumber',
                                                'type': 'string',
                                            },
                                            'Ref_VATNum': {
                                                'source': 'customer.idOfficial',
                                                'type': 'string',
                                            },
                                        },
                                    },
                                    'H_SellerParty': {
                                        'source': null,
                                        'type': 'object',
                                        'properties': {
                                            'ID_Code': {
                                                'source': 'externalIdTypeSeller',
                                                'type': 'string',
                                            },
                                            'ID': {
                                                'source': 'vendor.id',
                                                'type': 'string',
                                            },
                                            'Name': {
                                                'source': 'vendor.name',
                                                'type': 'string',
                                            },
                                            'Street': {
                                                'source': 'vendor.contactInformation.streetAddressLine1',
                                                'type': 'string',
                                            },
                                            'Zip': {
                                                'source': 'vendor.contactInformation.postalCode',
                                                'type': 'string',
                                            },
                                            'City': {
                                                'source': 'vendor.contactInformation.postalArea',
                                                'type': 'string',
                                            },
                                            'Country_Name': {
                                                'source': 'vendor.contactInformation.country',
                                                'type': 'string',
                                            },
                                            'Country_Code': {
                                                'source': 'vendor.countryCode',
                                                'type': 'string',
                                            },
                                            'Ref_VATNum': {
                                                'source': 'vendor.idOfficial',
                                                'type': 'string',
                                            },
                                        },
                                    },
                                    'H_ConsigneeParty': {
                                        'source': null,
                                        'type': 'object',
                                        'properties': {
                                            'ID_Code': {
                                                'source': 'externalIdTypeConsignee',
                                                'type': 'string',
                                            },
                                            'ID': {
                                                'source': 'addressShipping.id',
                                                'type': 'string',
                                            },
                                            'Name': {
                                                'source': 'addressShipping.name',
                                                'type': 'string',
                                            },
                                            'Street': {
                                                'source': 'addressShipping.streetAddressLine1',
                                                'type': 'string',
                                            },
                                            'Zip': {
                                                'source': 'addressShipping.postalCode',
                                                'type': 'string',
                                            },
                                            'City': {
                                                'source': 'addressShipping.postalArea',
                                                'type': 'string',
                                            },
                                            'Country_Name': {
                                                'source': 'addressShipping.country',
                                                'type': 'string',
                                            },
                                            'Country_Code': {
                                                'source': 'addressShipping.countryCode',
                                                'type': 'string',
                                            },
                                            'Ref_VATNum': {
                                                'source': 'addressShipping.idOfficial',
                                                'type': 'string',
                                            },
                                        },
                                    },
                                    'H_DeliveryParty': {
                                        'source': null,
                                        'type': 'object',
                                        'properties': {
                                            'ID_Code': {
                                                'source': 'externalIdTypeConsignee',
                                                'type': 'string',
                                            },
                                            'ID': {
                                                'source': 'addressShipping.id',
                                                'type': 'string',
                                            },
                                            'Name': {
                                                'source': 'addressShipping.name',
                                                'type': 'string',
                                            },
                                            'Street': {
                                                'source': 'addressShipping.streetAddressLine1',
                                                'type': 'string',
                                            },
                                            'Zip': {
                                                'source': 'addressShipping.postalCode',
                                                'type': 'string',
                                            },
                                            'City': {
                                                'source': 'addressShipping.postalArea',
                                                'type': 'string',
                                            },
                                            'Country_Name': {
                                                'source': 'addressShipping.country',
                                                'type': 'string',
                                            },
                                            'Country_Code': {
                                                'source': 'addressShipping.countryCode',
                                                'type': 'string',
                                            },
                                            'Contact_ID': {
                                                'source': 'addressShipping.contact.name',
                                                'type': 'string',
                                            },
                                            'Contact_Name': {
                                                'source': 'addressShipping.contact.contactInformation.name',
                                                'type': 'string',
                                            },
                                            'Contact_Phone': {
                                                'source': 'addressShipping.contact.contactInformation.phoneNumber',
                                                'type': 'string',
                                            },
                                            'Location_Place': {
                                                'source': 'addressShipping.nameArea',
                                                'type': 'string',
                                            },
                                            'Ref_VATNum': {
                                                'source': 'addressShipping.idOfficial',
                                                'type': 'string',
                                            },
                                        },
                                    },
                                    'H_Ref_Special': {
                                        'source': 'refSpecial',
                                        'type': 'array',
                                        'items': {
                                            'source': null,
                                            'type': 'object',
                                            'properties': {
                                                'H_Ref_Type': {
                                                    'source': 'type',
                                                    'type': 'string',
                                                },
                                                'H_Ref_Value': {
                                                    'source': 'value',
                                                    'type': 'string',
                                                },
                                            },
                                        },
                                    },
                                    'H_Freetext_Delivery': {
                                        'source': 'additionalInformation',
                                        'type': 'array',
                                        'items': {
                                            'anyOf': [
                                                {
                                                    'source': 'value',
                                                    'type': 'string',
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                            'Row': {
                                'source': 'orderLine',
                                'type': 'array',
                                'items': {
                                    'source': null,
                                    'type': 'object',
                                    'properties': {
                                        'R_LineItem_Num': {
                                            'source': 'idLocal',
                                            'type': 'string',
                                        },
                                        'R_Item_Num_EAN': {
                                            'source': 'product.gtin',
                                            'type': 'string',
                                        },
                                        'R_Item_Num_Sup': {
                                            'source': 'product.codeProduct',
                                            'type': 'string',
                                        },
                                        'R_Item_Desc': {
                                            'source': 'product.descriptionGeneral',
                                            'type': 'string',
                                        },
                                        'R_Quantity_OrdPcs': {
                                            'source': 'quantity',
                                            'type': 'string',
                                        },
                                        'R_Quantity_OrdUnit': {
                                            'source': 'unit',
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
};

const json2xml = (input = {}) => {
    input.externalMessageType = 'ORDERS';
    input.externalVersionType = '2x20R5B';
    input.externalDocType = 'ORD';
    input.externalIdTypeBuyer = 'EDI';
    input.externalIdTypeSeller = 'EDI';
    input.externalIdTypeConsignee = 'EDI';

    input.timestamp = new Date().getTime();
    input.dateOrdered = input.ordered ? input.ordered.slice(0, 10) : new Date().toISOString().slice(0, 10);
    input.timeOrdered = input.ordered ? input.ordered.slice(11, 19) : new Date().toISOString().slice(11, 19);
    input.dateOrderDelivery = input.deliveryRequired ? input.deliveryRequired.slice(0, 10) : '';
    input.timeOrderDelivery = input.deliveryRequired ? input.deliveryRequired.slice(11, 19) : '';

    input.addressBilling.idLocal = input.addressBilling.idLocal || '';
    input.addressBilling.countryCode = input.addressBilling.country.slice(0, 2).toUpperCase();

    input.contact.idOfficial = input.contact.idOfficial || '';
    input.contact.id = input.contact.idOfficial ? '0037' + input.contact.idOfficial.replace('-', '').replace('FI', '') : '';

    input.vendor.idOfficial = input.vendor.idOfficial || '';
    input.vendor.id = input.vendor.idOfficial ? '0037' + input.vendor.idOfficial.replace('-', '').replace('FI', '') : '';
    if (!input.vendor.idOfficial) {
        delete input.externalIdTypeSeller;
        delete input.vendor.id;
    }

    input.addressShipping.idLocal = input.addressShipping.idLocal || '';
    input.addressShipping.idOfficial = input.addressShipping.idOfficial || '';
    input.addressShipping.id = input.addressShipping.idOfficial ? '0037' + input.addressShipping.idOfficial.replace('-', '').replace('FI', '') : '';
    if (!input.addressShipping.idOfficial) {
        delete input.externalIdTypeConsignee;
        delete input.addressShipping.id;
    }
    input.addressShipping.countryCode = input.addressShipping.country.slice(0, 2).toUpperCase();

    input.customer.idOfficial = input.customer.idOfficial || '';
    input.customer.id = input.customer.idOfficial ? '0037' + input.customer.idOfficial.replace('-', '').replace('FI', '') : '';
    if (!input.customer.idOfficial) {
        delete input.externalIdTypeBuyer;
        delete input.customer.id;
    }
    input.customer.contactInformation = input.customer.contactInformation || {};
    input.customer.contactInformation.streetAddressLine1 = input.customer.contactInformation.streetAddressLine1 || '';
    input.customer.contactInformation.postalCode = input.customer.contactInformation.postalCode || '';
    input.customer.contactInformation.postalArea = input.customer.contactInformation.postalArea || '';
    input.customer.contactInformation.country = input.customer.contactInformation.country || '';

    input.refSpecial = [
        {type: 'WORKPACK', value: input.addressShipping.process.idLocal},
        {type: 'WORKPHASE', value: input.addressShipping.process.name},
    ];

    input.orderLine = input.orderLine.map(o => {
        // Not required anymore.
        // o.unit = o.unit.toUpperCase();
        return o;
    });

    input.additionalInformation = [
        {value: input.vendor.customer.idLocal || ''},
        {value: ''},
        {value: ''},
        {value: ''},
        {value: ''},
    ];

    let output;
    let xml;
    try {
        output = transformer.transform({
            ...input,
            '$': {
                'xsi:noNamespaceSchemaLocation': 'TCXML-V2x20R5B.xsd',
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

module.exports = {
    name: PLUGIN_NAME,
    template,
    output,
};
