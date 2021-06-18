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

const PLUGIN_NAME = 'stark';
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
    "source": null,
    "type": "object",
    "properties": {
        "Batch": {
            "source": null,
            "type": "object",
            "properties": {
                "$": {
                    "source": null,
                    "type": "object",
                    "properties": {
                        "xsi:noNamespaceSchemaLocation": {
                            "source": "$.xsi:noNamespaceSchemaLocation",
                            "type": "string",
                        },
                        "xmlns:xsi": {
                            "source": "$.xmlns:xsi",
                            "type": "string",
                        },
                    },
                },
				"Control": {
					"source": null,
                    "type": "object",
                    "properties": {
						"C_Msg_OriginalID": {
                            "source": "timetamp",
                            "type": "string",
                        },
                        "C_Msg_Sender": {
                            "source": "customer.id",
                            "type": "string",
                        },
						"C_Msg_Receiver": {
                            "source": "vendor.id",
                            "type": "string",
                        },
                        "C_Msg_Type": {
                            "source": "externalMessageType",
                            "type": "string",
                        },
						"C_VersionTCXML": {
							"source": "externalVersionType",
							"type": "string",
						},
                    },
				},
                "Msg": {
                    "source": '',
                    "type": "array",
                    "items": {
                        "source": null,
                        "type": "object",
                        "properties": {
							"Control": {
								"source": null,
								"type": "object",
								"properties": {
									"C_Msg_Sender": {
										"source": "customer.id",
										"type": "string",
									},
									"C_Msg_Receiver": {
										"source": "vendor.id",
										"type": "string",
									},
									"C_Msg_Type": {
										"source": "externalMessageType",
										"type": "string",
									},
									"C_VersionTCXML": {
										"source": "externalVersionType",
										"type": "string",
									},
								},
							},
                            "Hdr": {
                                "source": null,
                                "type": "object",
                                "properties": {
									"H_DocType_Code": {
                                        "source": "externalDocType",
                                        "type": "string",
                                    },
									"H_DocNumber_ID": {
                                        "source": "idLocal",
                                        "type": "string",
                                    },
									"H_Date_Order_Delivery": {
                                        "source": "dateOrderDelivery",
                                        "type": "string",
                                    },
                                    "H_Time_Order_Delivery": {
                                        "source": "timeOrderDelivery",
                                        "type": "string",
                                    },
                                    "H_Freetext_Gen": {
                                        "source": "descriptionGeneral",
                                        "type": "string",
                                    },
                                    "H_Ref_CustNum": {
                                        "source": "customer.ifOfficial",
                                        "type": "string",
                                    },
                                    "H_Ref_VendorNum": {
                                        "source": "vendor.idLocal",
                                        "type": "string",
                                    },
                                    "H_Ref_ProjNum": {
                                        "source": "project.idLocal",
                                        "type": "string",
                                    },
									"H_Ref_OrderNum": {
                                        "source": "idLocal",
                                        "type": "string",
                                    },
                                    "H_BuyerParty": {
                                        "source": null,
                                        "type": "object",
                                        "properties": {
											"ID_Code": {
                                                "source": "externalIdTypeBuyer",
                                                "type": "string",
                                            },
											"ID": {
                                                "source": "customer.id",
                                                "type": "string",
                                            },
                                            "Name": {
                                                "source": "customer.name",
                                                "type": "string",
                                            },
											"Street": {
												"source": "addressBilling.streetAddressLine1",
												"type": "string",
											},
											"Zip": {
												"source": "addressBilling.postalCode",
												"type": "string",
											},
											"City": {
												"source": "addressBilling.postalArea",
												"type": "string",
											},
											"Country_Name": {
												"source": "addressBilling.country",
												"type": "string",
											},
											"Country_Code": {
												"source": "addressBilling.countryCode",
												"type": "string",
											},
											"Email": {
                                                "source": "contact.contactInformation.addressEmail",
                                                "type": "string",
                                            },
                                            "Phone": {
                                                "source": "contact.contactInformation.phoneNumber",
                                                "type": "string",
                                            },
											"Ref_VATNum": {
                                                "source": "customer.idOfficial",
                                                "type": "string",
                                            },
                                        },
                                    },
                                    "H_SellerParty": {
                                        "source": null,
                                        "type": "object",
                                        "properties": {
											"ID_Code": {
                                                "source": "externalIdTypeSeller",
                                                "type": "string",
                                            },
											"ID": {
												"source": "vendor.id",
												"type": "string",
											},
											"Name": {
												"source": "vendor.name",
												"type": "string",
											},
											"Street": {
												"source": "vendor.contactInformation.streetAddressLine1",
												"type": "string",
											},
											"Zip": {
												"source": "vendor.contactInformation.postalCode",
												"type": "string",
											},
											"City": {
												"source": "vendor.contactInformation.postalArea",
												"type": "string",
											},
											"Country_Name": {
												"source": "vendor.contactInformation.country",
												"type": "string",
											},
											"Country_Code": {
												"source": "vendor.countryCode",
												"type": "string",
											},
											"Ref_VATNum": {
                                                "source": "vendor.idOfficial",
                                                "type": "string",
                                            },
                                        },
                                    },
                                    "H_ConsigneeParty": {
                                        "source": null,
                                        "type": "object",
                                        "properties": {
											"ID_Code": {
                                                "source": "externalIdTypeConsignee",
                                                "type": "string",
                                            },
											"ID": {
												"source": "addressShipping.id",
												"type": "string",
											},
											"Name": {
												"source": "addressShipping.name",
												"type": "string",
											},
											"Street": {
												"source": "addressShipping.streetAddressLine1",
												"type": "string",
											},
											"Zip": {
												"source": "addressShipping.postalCode",
												"type": "string",
											},
											"City": {
												"source": "addressShipping.postalArea",
												"type": "string",
											},
											"Country_Name": {
												"source": "addressShipping.country",
												"type": "string",
											},
											"Country_Code": {
												"source": "addressShipping.countryCode",
												"type": "string",
											},
											"Ref_VATNum": {
                                                "source": "addressShipping.idOfficial",
                                                "type": "string",
                                            },
                                        },
                                    },
                                },
                            },
                            "Row": {
                                "source": 'orderLine',
                                "type": "array",
                                "items": {
                                    "source": null,
                                    "type": "object",
                                    "properties": {
                                        "R_LineItem_Num": {
                                            "source": "idLocal",
                                            "type": "string",
                                        },
										"R_Item_Num_EAN": {
                                            "source": "product.idLocal",
                                            "type": "string",
                                        },
                                        "R_Item_Num_Sup": {
                                            "source": "product.codeProduct",
                                            "type": "string",
                                        },
                                        "R_Item_Desc": {
                                            "source": "product.descriptionGeneral",
                                            "type": "string",
                                        },
                                        "R_Quantity_OrdPcs": {
                                            "source": "quantity",
                                            "type": "string",
                                        },
                                        "R_Quantity_OrdUnit": {
                                            "source": "unit",
                                            "type": "string",
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
    input.externalIdTypeBuyer = 'EDI'
    input.externalIdTypeSeller = 'EDI'
    input.externalIdTypeConsignee = 'EDI'

    input.timestamp = new Date().getTime();
    input.dateOrderDelivery = input.deliveryRequired ? input.deliveryRequired.slice(0, 10) : ''
    input.timeOrderDelivery = input.deliveryRequired ? input.deliveryRequired.slice(11, 19) : ''

    input.addressBilling.idLocal = input.addressBilling.idLocal || '';
    input.addressBilling.countryCode = input.addressBilling.country.slice(0, 2).toUpperCase()
    
    input.contact.idOfficial = input.contact.idOfficial || '';
    input.contact.id = input.contact.idOfficial ? '0037' + input.contact.idOfficial.replace('-', '').replace('FI', '') : ''
    
    input.vendor.idOfficial = input.vendor.idOfficial || '';
    input.vendor.id = input.vendor.idOfficial ? '0037' + input.vendor.idOfficial.replace('-', '').replace('FI', '') : ''
    if (!input.vendor.idOfficial) {
        delete input.externalIdTypeSeller
        delete input.vendor.id
    }

    input.addressShipping.idLocal = input.addressShipping.idLocal || '';
    input.addressShipping.idOfficial = input.addressShipping.idOfficial || '';
    input.addressShipping.id = input.addressShipping.idOfficial ? '0037' + input.addressShipping.idOfficial.replace('-', '').replace('FI', '') : ''
    if (!input.addressShipping.idOfficial) {
        delete input.externalIdTypeConsignee
        delete input.addressShipping.id
    }
    input.addressShipping.countryCode = input.addressShipping.country.slice(0, 2).toUpperCase()

    input.customer.idOfficial = input.customer.idOfficial || '';
    input.customer.id = input.customer.idOfficial ? '0037' + input.customer.idOfficial.replace('-', '').replace('FI', '') : ''
    if (!input.customer.idOfficial) {
        delete input.externalIdTypeBuyer
        delete input.customer.id
    }
    input.customer.contactInformation = input.customer.contactInformation || {};
    input.customer.contactInformation.streetAddressLine1 = input.customer.contactInformation.streetAddressLine1 || '';
    input.customer.contactInformation.postalCode = input.customer.contactInformation.postalCode || '';
    input.customer.contactInformation.postalArea = input.customer.contactInformation.postalArea || '';
    input.customer.contactInformation.country = input.customer.contactInformation.country || '';

    input.orderLine = input.orderLine.map(o => {
        o.unit = o.unit.toUpperCase()
        return o
    });

    const output = transformer.transform({
        ...input,
        '$': {
            'xsi:noNamespaceSchemaLocation': 'TCXML-V2x20R5B.xsd',
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
