'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Orfer.
 */

/**
 * Splits processes.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        if (!Array.isArray(response)) {
            response = [response];
        }
        if (Array.isArray(response)) {
            response = response.map(d => {
                if (Object.hasOwnProperty.call(d, 'Tilaus')) {
                    if (Array.isArray(d.Tilaus)) {
                        const mainOrder = d;
                        mainOrder.orderCount = d.Tilaus.length;
                        // To be recognized as a order process.
                        mainOrder.order = true;
                        mainOrder.name = 'Order';
                        const childOrders = d.Tilaus.map(o => {
                            return {
                                // Store main order id to child.
                                orderId: mainOrder.Tilausnumero,
                                reel: {
                                    type: 'Reel',
                                },
                                pallet: {
                                    type: 'Pallet',
                                },
                                childOrder: true,
                                name: 'childOrder',
                                ...o,
                                /** Additional fields. */
                                Company: mainOrder.Company,
                                Factory: mainOrder.Factory,
                                Line: mainOrder.Line,
                                Order_Id: mainOrder.Order_Id,
                            };
                        });
                        const slittings = d.Tilaus.map(() => {
                            return {
                                orderId: mainOrder.Tilausnumero,
                                POS_Timestamp: mainOrder.POS_Timestamp,
                                Start_Timestamp: mainOrder.Start_Timestamp,
                                operatorId: mainOrder.OperatorId,
                                executorName: mainOrder.Slitter_name,
                                Workcenter: mainOrder.Workcenter,
                                // To be recognized as a slitting process.
                                slitting: true,
                                name: 'Slitting',
                                /** Additional fields. */
                                Company: mainOrder.Company,
                                Factory: mainOrder.Factory,
                                Line: mainOrder.Line,
                                Order_Id: mainOrder.Order_Id,
                            };
                        });
                        delete mainOrder.Tilaus;
                        // Return orders.
                        return [mainOrder, ...childOrders, ...slittings];
                    }
                    return d;
                } else if (Object.keys(d).some(key => key.includes('Tulokuljetin'))) {
                    const mainMoving = d;
                    mainMoving.executorIdLocal = mainMoving.RobotId || 0;
                    mainMoving.executorCategorizationLocal = 'Robot';
                    // To be recognized as a moving process.
                    mainMoving.moving = true;
                    mainMoving.name = 'Moving';
                    const childMovings = Object.entries(d).filter(e => e[0].includes('Tulokuljetin')).map((t) => {
                        const executorIdLocal = 'Tulokuljetin' + t[0][12];
                        const obj = {
                            robotId: mainMoving.executorIdLocal,
                            executorIdLocal,
                            executorCategorizationLocal: 'Conveyor',
                            Status: mainMoving[executorIdLocal + '_Status'],
                            // ReelId: mainMoving.ReelId,
                            // To be recognized as a moving process.
                            moving: true,
                            name: 'Moving',
                            /** Additional fields. */
                            Company: mainMoving.Company,
                            Factory: mainMoving.Factory,
                            Line: mainMoving.Line,
                            Order_Id: mainMoving.Order_Id,
                        };
                        return obj;
                    });
                    delete mainMoving.RobotId;
                    delete mainMoving.Tulokuljetin1_Status;
                    return [mainMoving, ...childMovings];
                } else if (Object.keys(d).some(key => key.includes('Paikka_') || key.includes('Output_'))) {
                    const mainWrapping = d;
                    mainWrapping.executorIdLocal = mainWrapping.WrapperId || 0;
                    // To be recognized as a wrapping process.
                    mainWrapping.wrapping = true;
                    mainWrapping.name = 'Wrapping';
                    const childMovings = Object.entries(d)
                        .filter(e => e[0].includes('Paikka_') || e[0].includes('Output_')).map((t) => {
                            const executorIdLocal = t[0].includes('Paikka_') ? 'Paikka_' + t[0][7] : 'Output';
                            const obj = {
                                wrapperId: mainWrapping.executorIdLocal,
                                executorIdLocal,
                                executorCategorizationLocal: 'Conveyor',
                                ReelId: mainWrapping[executorIdLocal + '_ReelId'] || '',
                                // To be recognized as a moving process.
                                moving: true,
                                name: 'Moving',
                                /** Additional fields. */
                                Company: mainWrapping.Company,
                                Factory: mainWrapping.Factory,
                                Line: mainWrapping.Line,
                                Order_Id: mainWrapping.Order_Id,
                            };
                            return obj;
                        });
                    delete mainWrapping.WrapperId;
                    delete mainWrapping.Paikka_1_ReelId;
                    delete mainWrapping.Paikka_2_ReelId;
                    delete mainWrapping.Paikka_3_ReelId;
                    delete mainWrapping.Paikka_5_ReelId;
                    delete mainWrapping.Output_ReelId;
                    return [mainWrapping, ...childMovings];
                } else if (Object.keys(d).some(key => key.includes('Quality'))) {
                    const qualityCheck = d;
                    // To be recognized as a qualityCheck process.
                    qualityCheck.qualityCheck = true;
                    qualityCheck.name = 'QualityCheck';
                    return [qualityCheck];
                }
                return d;
            });
            return response.flat();
        }
    } catch (e) {
        return response;
    }
};

// Source mapping.
const schemas = {
    qualityCheckSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema',
        'properties': {
            '@context': {
                '$id': '#/properties/@context',
                'source': null,
                'type': 'string',
                'title': 'JSON-LD context url',
                'description': 'JSON-LD context url with terms required to understand data product content.',
                'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/',
            },
            'data': {
                '$id': '#/properties/data',
                'source': null,
                'type': 'object',
                'title': 'Data product output',
                'description': 'Output of data product delivered to customers.',
                'properties': {
                    'process': {
                        '$id': '#/properties/data/properties/process',
                        'source': null,
                        'type': 'object',
                        'title': 'Process',
                        'description': 'Product returned from catalog.',
                        'properties': {
                            'type': {
                                '$id': '#/properties/data/properties/process/properties/type',
                                'source': 'type',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/process/properties/name',
                                'source': 'name',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'timestamp': {
                                '$id': '#/properties/data/properties/process/properties/timestamp',
                                'source': 'ts',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/properties/executor',
                                'source': null,
                                'type': 'object',
                                'title': 'The executor schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/type',
                                        'source': 'executorType',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/idLocal',
                                        'source': 'Tilausnumero',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'reelId': {
                                '$id': '#/properties/data/properties/process/properties/reelId',
                                'source': 'Rullanumero',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'slitterId': {
                                '$id': '#/properties/data/properties/process/properties/slitterId',
                                'source': 'slitterId',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'width': {
                                '$id': '#/properties/data/properties/process/properties/width',
                                'source': 'Width',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'length': {
                                '$id': '#/properties/data/properties/process/properties/length',
                                'source': 'Length',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'diameter': {
                                '$id': '#/properties/data/properties/process/properties/diameter',
                                'source': 'Diameter',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'completed': {
                                '$id': '#/properties/data/properties/process/properties/completed',
                                'source': 'Timestamp',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'quality': {
                                '$id': '#/properties/data/properties/process/properties/quality',
                                'source': 'Quality',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'qualityReason': {
                                '$id': '#/properties/data/properties/process/properties/qualityReason',
                                'source': 'ReasonCode',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'company': {
                                '$id': '#/properties/data/properties/process/properties/company',
                                'source': 'Company',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'factory': {
                                '$id': '#/properties/data/properties/process/properties/factory',
                                'source': 'Factory',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'productionLine': {
                                '$id': '#/properties/data/properties/process/properties/productionLine',
                                'source': 'Line',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'globalOrderId': {
                                '$id': '#/properties/data/properties/process/properties/globalOrderId',
                                'source': 'Order_Id',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                        },
                    },
                },
            },
        },
    },
    orderSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema',
        'properties': {
            '@context': {
                '$id': '#/properties/@context',
                'source': null,
                'type': 'string',
                'title': 'JSON-LD context url',
                'description': 'JSON-LD context url with terms required to understand data product content.',
                'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/',
            },
            'data': {
                '$id': '#/properties/data',
                'source': null,
                'type': 'object',
                'title': 'Data product output',
                'description': 'Output of data product delivered to customers.',
                'properties': {
                    'process': {
                        '$id': '#/properties/data/properties/process',
                        'source': null,
                        'type': 'object',
                        'title': 'Product',
                        'description': 'Product returned from catalog.',
                        'properties': {
                            'type': {
                                '$id': '#/properties/data/properties/process/properties/type',
                                'source': 'type',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/process/properties/name',
                                'source': 'name',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'timestamp': {
                                '$id': '#/properties/data/properties/process/properties/timestamp',
                                'source': 'ts',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/properties/executor',
                                'source': null,
                                'type': 'object',
                                'title': 'The executor schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/type',
                                        'source': 'executorType',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/idLocal',
                                        'source': 'Tilausnumero',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'orderCount': {
                                '$id': '#/properties/data/properties/process/properties/orderCount',
                                'source': 'orderCount',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'instructionTime': {
                                '$id': '#/properties/data/properties/process/properties/instructionTime',
                                'source': 'POS_Timestamp',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'startDateTime': {
                                '$id': '#/properties/data/properties/process/properties/startDateTime',
                                'source': 'Start_Timestamp',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'company': {
                                '$id': '#/properties/data/properties/process/properties/company',
                                'source': 'Company',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'factory': {
                                '$id': '#/properties/data/properties/process/properties/factory',
                                'source': 'Factory',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'productionLine': {
                                '$id': '#/properties/data/properties/process/properties/productionLine',
                                'source': 'Line',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'globalOrderId': {
                                '$id': '#/properties/data/properties/process/properties/globalOrderId',
                                'source': 'Order_Id',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                        },
                    },
                },
            },
        },
    },
    childOrderSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema',
        'properties': {
            '@context': {
                '$id': '#/properties/@context',
                'source': null,
                'type': 'string',
                'title': 'JSON-LD context url',
                'description': 'JSON-LD context url with terms required to understand data product content.',
                'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/',
            },
            'data': {
                '$id': '#/properties/data',
                'source': null,
                'type': 'object',
                'title': 'Data product output',
                'description': 'Output of data product delivered to customers.',
                'properties': {
                    'process': {
                        '$id': '#/properties/data/properties/process',
                        'source': null,
                        'type': 'object',
                        'title': 'Process',
                        'description': 'Product returned from catalog.',
                        'properties': {
                            'type': {
                                '$id': '#/properties/data/properties/process/properties/type',
                                'source': 'type',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/process/properties/name',
                                'source': 'name',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'timestamp': {
                                '$id': '#/properties/data/properties/process/properties/timestamp',
                                'source': 'ts',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/properties/executor',
                                'source': null,
                                'type': 'object',
                                'title': 'The executor schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/type',
                                        'source': 'executorType',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/idLocal',
                                        'source': 'Tilausnumero',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'reelCount': {
                                '$id': '#/properties/data/properties/process/properties/reelCount',
                                'source': 'reelCount',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'palletCount': {
                                '$id': '#/properties/data/properties/process/properties/palletCount',
                                'source': 'palletCount',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'orderId': {
                                '$id': '#/properties/data/properties/process/properties/orderId',
                                'source': 'orderId',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'reel': {
                                '$id': '#/properties/data/properties/process/properties/reel',
                                'source': null,
                                'type': 'object',
                                'title': 'The reel schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/type',
                                        'source': 'reel.type',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'width': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/width',
                                        'source': 'Width',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'length': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/length',
                                        'source': 'Length',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'diameter': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/diameter',
                                        'source': 'Diameter',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'density': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/density',
                                        'source': 'Density',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'amountWrapping': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/amountWrapping',
                                        'source': 'Wrapping',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'code': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/code',
                                        'source': 'MaterialNumber',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'ReelPackingTime': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/ReelPackingTime',
                                        'source': 'PACKINF_timestamp',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'ReelLabelingTime': {
                                        '$id': '#/properties/data/properties/process/properties/reel/properties/ReelLabelingTime',
                                        'source': 'PPO_Timestamp',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'pallet': {
                                '$id': '#/properties/data/properties/process/properties/pallet',
                                'source': null,
                                'type': 'object',
                                'title': 'The pallet schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/type',
                                        'source': 'pallet.type',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'categorizationLocal': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/categorizationLocal',
                                        'source': 'Pallet_type',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'itemsPerLayer': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/itemsPerLayer',
                                        'source': 'Rolls_per_layer',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'layerAmount': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/layerAmount',
                                        'source': 'Layers_per_pallet',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'itemsTotal': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/itemsTotal',
                                        'source': 'ReelCount',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'PalletTop': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/PalletTop',
                                        'source': 'Pallet_top',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'PalletIntermediate': {
                                        '$id': '#/properties/data/properties/process/properties/pallet/properties/PalletIntermediate',
                                        'source': 'Pallet_intermediate',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'company': {
                                '$id': '#/properties/data/properties/process/properties/company',
                                'source': 'Company',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'factory': {
                                '$id': '#/properties/data/properties/process/properties/factory',
                                'source': 'Factory',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'productionLine': {
                                '$id': '#/properties/data/properties/process/properties/productionLine',
                                'source': 'Line',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'globalOrderId': {
                                '$id': '#/properties/data/properties/process/properties/globalOrderId',
                                'source': 'Order_Id',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                        },
                    },
                },
            },
        },
    },
    slittingSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema',
        'properties': {
            '@context': {
                '$id': '#/properties/@context',
                'source': null,
                'type': 'string',
                'title': 'JSON-LD context url',
                'description': 'JSON-LD context url with terms required to understand data product content.',
                'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/',
            },
            'data': {
                '$id': '#/properties/data',
                'source': null,
                'type': 'object',
                'title': 'Data product output',
                'description': 'Output of data product delivered to customers.',
                'properties': {
                    'process': {
                        '$id': '#/properties/data/properties/process',
                        'source': null,
                        'type': 'object',
                        'title': 'Process',
                        'description': 'Product returned from catalog.',
                        'properties': {
                            'type': {
                                '$id': '#/properties/data/properties/process/properties/type',
                                'source': 'type',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/process/properties/name',
                                'source': 'name',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'timestamp': {
                                '$id': '#/properties/data/properties/process/properties/timestamp',
                                'source': 'ts',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/properties/executor',
                                'source': null,
                                'type': 'object',
                                'title': 'The executor schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/type',
                                        'source': 'executorType',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/idLocal',
                                        'source': 'Workcenter',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/name',
                                        'source': 'executorName',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'categorizationLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/categorizationLocal',
                                        'source': 'executorCategorizationLocal',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'company': {
                                '$id': '#/properties/data/properties/process/properties/company',
                                'source': 'Company',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'factory': {
                                '$id': '#/properties/data/properties/process/properties/factory',
                                'source': 'Factory',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'productionLine': {
                                '$id': '#/properties/data/properties/process/properties/productionLine',
                                'source': 'Line',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'globalOrderId': {
                                '$id': '#/properties/data/properties/process/properties/globalOrderId',
                                'source': 'Order_Id',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                        },
                    },
                },
            },
        },
    },
    movingSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema',
        'properties': {
            '@context': {
                '$id': '#/properties/@context',
                'source': null,
                'type': 'string',
                'title': 'JSON-LD context url',
                'description': 'JSON-LD context url with terms required to understand data product content.',
                'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/',
            },
            'data': {
                '$id': '#/properties/data',
                'source': null,
                'type': 'object',
                'title': 'Data product output',
                'description': 'Output of data product delivered to customers.',
                'properties': {
                    'process': {
                        '$id': '#/properties/data/properties/process',
                        'source': null,
                        'type': 'object',
                        'title': 'Product',
                        'description': 'Product returned from catalog.',
                        'properties': {
                            'type': {
                                '$id': '#/properties/data/properties/process/properties/type',
                                'source': 'type',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/process/properties/name',
                                'source': 'name',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'timestamp': {
                                '$id': '#/properties/data/properties/process/properties/timestamp',
                                'source': 'ts',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/properties/executor',
                                'source': null,
                                'type': 'object',
                                'title': 'The executor schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/supplier/properties/name',
                                        'source': 'executorType',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/properties/supplier/properties/idLocal',
                                        'source': 'executorIdLocal',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/idLocal',
                                        'source': 'robottype',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'categorizationLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/categorizationLocal',
                                        'source': 'executorCategorizationLocal',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'status': {
                                '$id': '#/properties/data/properties/process/properties/status',
                                'source': 'Status',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'error': {
                                '$id': '#/properties/data/properties/process/properties/error',
                                'source': 'Virhekoodi.Koodi',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'errorMessage': {
                                '$id': '#/properties/data/properties/process/properties/errorMessage',
                                'source': 'Virhekoodi.VirheString',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'robotId': {
                                '$id': '#/properties/data/properties/process/properties/robotId',
                                'source': 'robotId',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'wrapperId': {
                                '$id': '#/properties/data/properties/process/properties/wrapperId',
                                'source': 'wrapperId',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'reelId': {
                                '$id': '#/properties/data/properties/process/properties/reelId',
                                'source': 'ReelId',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'company': {
                                '$id': '#/properties/data/properties/process/properties/company',
                                'source': 'Company',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'factory': {
                                '$id': '#/properties/data/properties/process/properties/factory',
                                'source': 'Factory',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'productionLine': {
                                '$id': '#/properties/data/properties/process/properties/productionLine',
                                'source': 'Line',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'globalOrderId': {
                                '$id': '#/properties/data/properties/process/properties/globalOrderId',
                                'source': 'Order_Id',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                        },
                    },
                },
            },
        },
    },
    wrappingSchema: {
        '$schema': 'http://json-schema.org/draft-07/schema',
        'properties': {
            '@context': {
                '$id': '#/properties/@context',
                'source': null,
                'type': 'string',
                'title': 'JSON-LD context url',
                'description': 'JSON-LD context url with terms required to understand data product content.',
                'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/',
            },
            'data': {
                '$id': '#/properties/data',
                'source': null,
                'type': 'object',
                'title': 'Data product output',
                'description': 'Output of data product delivered to customers.',
                'properties': {
                    'process': {
                        '$id': '#/properties/data/properties/process',
                        'source': null,
                        'type': 'object',
                        'title': 'Product',
                        'description': 'Product returned from catalog.',
                        'properties': {
                            'type': {
                                '$id': '#/properties/data/properties/process/properties/type',
                                'source': 'type',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/process/properties/name',
                                'source': 'name',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'timestamp': {
                                '$id': '#/properties/data/properties/process/properties/timestamp',
                                'source': 'ts',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/properties/executor',
                                'source': null,
                                'type': 'object',
                                'title': 'The executor schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'properties': {
                                    'type': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/type',
                                        'source': 'executorType',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/idLocal',
                                        'source': 'executorIdLocal',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/name',
                                        'source': 'robottype',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                    'categorizationLocal': {
                                        '$id': '#/properties/data/properties/process/properties/executor/properties/categorizationLocal',
                                        'source': 'executorCategorizationLocal',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                    },
                                },
                            },
                            'status': {
                                '$id': '#/properties/data/properties/process/properties/status',
                                'source': 'Status',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'error': {
                                '$id': '#/properties/data/properties/process/properties/error',
                                'source': 'Virhekoodi.Koodi',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'wrapperId': {
                                '$id': '#/properties/data/properties/process/properties/wrapperId',
                                'source': 'Virhekoodi.VirheString',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'reelId': {
                                '$id': '#/properties/data/properties/process/properties/reelId',
                                'source': 'ReelId',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'company': {
                                '$id': '#/properties/data/properties/process/properties/company',
                                'source': 'Company',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'factory': {
                                '$id': '#/properties/data/properties/process/properties/factory',
                                'source': 'Factory',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'productionLine': {
                                '$id': '#/properties/data/properties/process/properties/productionLine',
                                'source': 'Line',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'globalOrderId': {
                                '$id': '#/properties/data/properties/process/properties/globalOrderId',
                                'source': 'Order_Id',
                                'type': 'string',
                                'title': '',
                                'description': '',
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
    let object = {};
    try {
        for (let j = 0; j < data.length; j++) {
            let result = {};
            const value = data[j][config.output.value];
            const ts = new Date(Date.now());

            // Include parameters.
            value.type = 'Process';
            value.ts = ts.toISOString();

            let schemaName = 'orderSchema';

            // Interpret process name.
            if (Object.hasOwnProperty.call(value, 'Quality')) {
                value.executorType = 'Order';
                value.name = 'QualityCheck';
                schemaName = 'qualityCheckSchema';
            }
            if (Object.hasOwnProperty.call(value, 'RobotId') ||
                Object.hasOwnProperty.call(value, 'moving')) {
                value.executorType = 'Machine';
                value.name = 'Moving';
                schemaName = 'movingSchema';
            }
            if (Object.hasOwnProperty.call(value, 'Virhekoodit') ||
                Object.hasOwnProperty.call(value, 'wrapping')) {
                value.executorType = 'Machine';
                value.name = 'Wrapping';
                schemaName = 'wrappingSchema';
                value.executorCategorizationLocal = 'Wrapper';
            }
            if (Object.hasOwnProperty.call(value, 'executorName') ||
                Object.hasOwnProperty.call(value, 'slitting')) {
                value.executorType = 'Machine';
                value.name = 'Slitting';
                schemaName = 'slittingSchema';
                value.executorCategorizationLocal = 'Slitter';
            }
            if (Object.hasOwnProperty.call(value, 'ReelCount') ||
                Object.hasOwnProperty.call(value, 'childOrder')) {
                value.executorType = 'Order';
                value.name = 'ChildOrder';
                schemaName = 'childOrderSchema';
            }
            if (Object.hasOwnProperty.call(value, 'order')) {
                value.executorType = 'Order';
                value.name = 'Order';
                schemaName = 'orderSchema';
            }

            result = transformer.transform(value, schemas[schemaName].properties.data);

            // Make sure name, executor.idLocal and executor.type are strings.
            try {
                result.process.name = String(result.process.name);
                result.process.executor.idLocal = String(result.process.executor.idLocal);
                result.process.executor.type = String(result.process.executor.type);
            } catch (e) {
                console.log(e.message);
            }

            if (Object.hasOwnProperty.call(result.process, 'timestamp')) {
                result.process.timestamp = new Date(result.process.timestamp).toISOString();
            }
            if (Object.hasOwnProperty.call(result.process, 'instructionTime')) {
                result.process.instructionTime = new Date(result.process.instructionTime).toISOString();
            }
            if (Object.hasOwnProperty.call(result.process, 'startDateTime')) {
                result.process.startDateTime = new Date(result.process.startDateTime).toISOString();
            }
            if (Object.hasOwnProperty.call(result.process, 'completed')) {
                result.process.completed = new Date(result.process.completed).toISOString();
            }

            if (Object.hasOwnProperty.call(result.process, 'reel')) {
                if (Object.hasOwnProperty.call(result.process.reel, 'ReelPackingTime')) {
                    result.process.reel.ReelPackingTime = new Date(result.process.reel.ReelPackingTime).toISOString();
                }
                if (Object.hasOwnProperty.call(result.process.reel, 'ReelLabelingTime')) {
                    result.process.reel.ReelLabelingTime = new Date(result.process.reel.ReelLabelingTime).toISOString();
                }
            }

            // Include milliseconds of the timestamp.
            try {
                result.process.timestamp_milliseconds = ts.getTime();
            } catch (e) {
                console.log(e.message);
            }

            // Merge all processes to same result.
            if (Object.hasOwnProperty.call(object, 'process')) {
                if (!Array.isArray(object.process)) {
                    object.process = [object.process];
                }
                if (!Array.isArray(result.process)) {
                    result.process = [result.process];
                }
                object.process.push(...result.process);
            } else {
                object = result;
            }
        }
        return object;
    } catch (err) {
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
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'orfer',
    response,
    output,
};
