'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');


// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/Process/Measure/WaterMeterReading?v=3.0',
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'type': 'string',
            'const': 'https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/Process/Measure/WaterMeterReading/?v=3.0',
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
                'process': {
                    '$id': '#/properties/data/properties/process',
                    'source': '',
                    'type': 'array',
                    'title': 'Process',
                    'description': 'A process is a single activity or set of activities that interact to produce a result.',
                    'items': {
                        '$id': '#/properties/data/properties/process/items',
                        'source': null,
                        'type': 'object',
                        'required': [],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/process/items/properties/@type',
                                'type': 'string',
                                'source': 'measureType',
                                'title': 'Identity type',
                                'description': 'Type of identity.',
                            },
                            'executor': {
                                '$id': '#/properties/data/properties/process/items/properties/executor',
                                'type': 'array',
                                'source': null,
                                'title': 'Process executor',
                                'description': 'Executor of the process (source of the data).',
                                'items': {
                                    '$id': '#/properties/data/properties/process/items/properties/executor/items',
                                    'source': null,
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/process/items/properties/executor/items/properties/@type',
                                            'type': 'string',
                                            'source': null,
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'name': {
                                            '$id': '#/properties/data/properties/process/items/properties/executor/items/properties/name',
                                            'type': null,
                                            'source': null,
                                            'title': 'Name',
                                            'description': 'Name.',
                                        },
                                        'idLocal': {
                                            '$id': '#/properties/data/properties/process/items/properties/executor/items/properties/idLocal',
                                            'type': null,
                                            'source': null,
                                            'title': 'Local identifier',
                                            'description': 'Locally given identifier.',
                                        },
                                    },
                                },
                            },
                            'location': {
                                '$id': '#/properties/data/properties/process/items/properties/location',
                                'type': 'object',
                                'source': '',
                                'title': 'Location',
                                'description': 'Property category for location related information.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/@type',
                                        'type': 'string',
                                        'source': 'locationType',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/name',
                                        'type': 'string',
                                        'source': 'buildingName',
                                        'title': 'Name',
                                        'description': 'Name.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/idLocal',
                                        'type': 'string',
                                        'source': 'id',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'description': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/description',
                                        'type': 'string',
                                        'source': null,
                                        'title': 'Property category for descriptive information',
                                        'description': 'Property category for descriptive information.',
                                    },
                                    'streetAddressLine1': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/streetAddressLine1',
                                        'type': 'string',
                                        'source': 'buildingAddress',
                                        'title': 'Street address line 1',
                                        'description': 'Street address line 1.',
                                    },
                                    'postalCode': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/postalCode',
                                        'type': 'string',
                                        'source': null,
                                        'title': 'Postal code',
                                        'description': 'Postal code.',
                                    },
                                    'city': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/city',
                                        'type': 'string',
                                        'source': null,
                                        'title': 'City',
                                        'description': 'City.',
                                    },
                                    'countryCode': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/countryCode',
                                        'type': 'string',
                                        'source': null,
                                        'title': 'Country code',
                                        'description': 'Country code.',
                                    },
                                    'locationPoint': {
                                        '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint',
                                        'type': 'object',
                                        'source': null,
                                        'title': 'Location point',
                                        'description': 'Location point.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint/properties/@type',
                                                'type': 'string',
                                                'title': 'Identity type',
                                                'description': 'Type of identity.',
                                            },
                                            'location': {
                                                '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint/properties/location',
                                                'type': 'array',
                                                'title': 'Location',
                                                'description': 'Property category for location related information.',
                                                'items': {
                                                    '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint/properties/location/items',
                                                    'type': 'object',
                                                    'required': [],
                                                    'properties': {
                                                        '@type': {
                                                            '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint/properties/location/items/properties/@type',
                                                            'type': 'string',
                                                            'title': 'Identity type',
                                                            'description': 'Type of identity.',
                                                        },
                                                        'longitude': {
                                                            '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint/properties/location/items/properties/longitude',
                                                            'type': 'number',
                                                            'title': 'Longitude',
                                                            'description': 'Angular distance east or west on the earth\'s surface, measured by the angle contained between the meridian of a particular place and some prime meridian, as that of Greenwich, England, and expressed either in degrees or by some corresponding difference in time (WGS 84).',
                                                        },
                                                        'latitude': {
                                                            '$id': '#/properties/data/properties/process/items/properties/location/properties/locationPoint/properties/location/items/properties/latitude',
                                                            'type': 'number',
                                                            'title': 'Latitude',
                                                            'description': 'The angular distance north or south from the equator of a point on the earth\'s surface, measured on the meridian of the point (WGS 84).',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            'processTarget': {
                                '$id': '#/properties/data/properties/process/items/properties/processTarget',
                                'type': 'string',
                                'source': 'processTarget',
                                'enum': [
                                    'Water',
                                ],
                                'title': 'Process target',
                                'description': 'Object into which process (verb) is targeted.',
                            },
                            'physicalProperty': {
                                '$id': '#/properties/data/properties/process/items/properties/physicalProperty',
                                'type': 'string',
                                'source': 'physicalProperty',
                                'enum': [
                                    'Volume',
                                ],
                                'title': 'Physical property',
                                'description': 'Physical property.',
                            },
                            'processValue': {
                                '$id': '#/properties/data/properties/process/items/properties/processValue',
                                'type': 'array',
                                'source': 'readings',
                                'title': 'Output value',
                                'description': 'Output value of the process.',
                                'items': {
                                    '$id': '#/properties/data/properties/process/items/properties/processValue/items',
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/process/items/properties/processValue/items/properties/@type',
                                            'type': 'string',
                                            'source': 'valueType',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'processValueStart': {
                                            '$id': '#/properties/data/properties/process/items/properties/processValue/items/properties/processValueStart',
                                            'type': 'string',
                                            'source': 'startValue',
                                            'title': 'Process value start',
                                            'description': 'Process value start.',
                                        },
                                        'processValue': {
                                            '$id': '#/properties/data/properties/process/items/properties/processValue/items/properties/processValue',
                                            'type': 'string',
                                            'source': 'value',
                                            'title': 'Output value',
                                            'description': 'Output value of the process.',
                                        },
                                        'processValueEnd': {
                                            '$id': '#/properties/data/properties/process/items/properties/processValue/items/properties/processValueEnd',
                                            'type': 'string',
                                            'source': 'endValue',
                                            'title': 'Process value end',
                                            'description': 'Process value end.',
                                        },
                                        'unitOfMeasure': {
                                            '$id': '#/properties/data/properties/process/items/properties/processValue/items/properties/unitOfMeasure',
                                            'type': 'string',
                                            'source': 'unitOfMeasure',
                                            'enum': [
                                                'Liter',
                                            ],
                                            'title': 'Unit of measure',
                                            'description': 'Unit of measure.',
                                        },
                                        'period': {
                                            '$id': '#/properties/data/properties/process/items/properties/processValue/items/properties/period',
                                            'type': 'string',
                                            'source': 'period',
                                            'title': 'Period',
                                            'description': 'Period.',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                'signature': {
                    '$id': '#/properties/data/properties/signature',
                    'type': 'object',
                    'title': 'Signature',
                    'description': 'Signature.',
                    'required': [],
                    'properties': {
                        'type': {
                            '$id': '#/properties/data/properties/signature/properties/type',
                            'type': 'string',
                            'title': 'Type',
                            'description': 'Type.',
                        },
                        'created': {
                            '$id': '#/properties/data/properties/signature/properties/created',
                            'type': 'string',
                            'title': 'Created',
                            'description': 'Creation time.',
                        },
                        'creator': {
                            '$id': '#/properties/data/properties/signature/properties/creator',
                            'type': 'string',
                            'title': 'Creator',
                            'description': 'Party who has created the file or information.',
                        },
                        'signatureValue': {
                            '$id': '#/properties/data/properties/signature/properties/signatureValue',
                            'type': 'string',
                            'title': 'Signature value',
                            'description': 'Signature value.',
                        },
                    },
                },
            },
        },
    },
    'version': '3.0',
};

/**
 * Splits period to start and end properties.
 *
 * @param {Object} config
 * @param {Object/String} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'period')) {
            parameters.start = parameters.period.split('/')[0];
            parameters.end = parameters.period.split('/')[1];
        }
        return parameters;
    } catch (e) {
        return parameters;
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
    let result = {};
    try {
        for (let j = 0; j < data.length; j++) {
            const value = data[j][config.output.value];

            // Transform raw input.

            const coldDaily = value.readings.map(reading => reading.cold.delta);
            const coldDailySum = coldDaily.reduce((partial_sum, a) => partial_sum + a, 0);

            const hotDaily = value.readings.map(reading => reading.warm.delta);
            const hotDailySum = hotDaily.reduce((partial_sum, a) => partial_sum + a, 0);

            const WaterCold = {value: coldDailySum, period: config.parameters.period, unitOfMeasure: 'Liter', valueType: 'Value', startValue: value.readings[0].cold.reading - value.readings[0].cold.delta, endValue: value.readings[value.readings.length - 1].cold.reading};
            const WaterHot = {value: hotDailySum, period: config.parameters.period, unitOfMeasure: 'Liter', valueType: 'Value', startValue: value.readings[0].warm.reading - value.readings[0].warm.delta, endValue: value.readings[value.readings.length - 1].warm.reading};

            const coldValues = {...value, readings: [WaterCold], processTarget: 'WaterCold', measureType: 'Measure', locationType: 'Location', physicalProperty: 'Volume'};
            const hotValues = {...value, readings: [WaterHot], processTarget: 'WaterHotm', measureType: 'Measure', locationType: 'Location', physicalProperty: 'Volume'};

            const valuesArray = [coldValues, hotValues];

            result = transformer.transform(valuesArray, schema.properties.data);
        }
        return result;
    } catch (err) {
        return result;
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
    name: 'vertolive',
    parameters,
    output,
};
