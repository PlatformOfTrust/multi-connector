'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Nysse.
 */

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-07/schema',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/VehicleInformation',
    'source': null,
    'type': 'object',
    'title': 'Data product output core schema',
    'description': 'Core schema for general data product output.',
    'required': [
        '@context',
        'data',
        'signature',
    ],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'title': 'JSON-LD context url',
            'description': 'JSON-LD context url with terms required to understand data product content.',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/VehicleInformation/',
        },
        'data': {
            '$id': '#/properties/data',
            'source': null,
            'type': 'object',
            'title': 'Data product output',
            'description': 'Output of data product delivered to customers.',
            'required': [
                'transportationRoute',
            ],
            'properties': {
                'transportationRoute': {
                    '$id': '#/properties/data/properties/route',
                    'source': '',
                    'type': 'array',
                    'title': 'The route schema',
                    'description': 'An explanation about the purpose of this instance.',
                    'items': {
                        '$id': '#/properties/data/properties/route/items',
                        'anyOf': [
                            {
                                '$id': '#/properties/data/properties/route/items/anyOf/0',
                                'source': null,
                                'type': 'object',
                                'title': 'The first anyOf schema',
                                'description': 'An explanation about the purpose of this instance.',
                                'required': [
                                    '@type',
                                    'operator',
                                    'vehicle',
                                ],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/route/items/anyOf/0/properties/%40type',
                                        'source': 'type',
                                        'default': 'TransportationRoute',
                                        'type': 'string',
                                        'title': 'The @type schema',
                                        'description': 'An explanation about the purpose of this instance.',
                                    },
                                    'operator': {
                                        '$id': '#/properties/data/properties/route/items/anyOf/0/properties/operator',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Operator',
                                        'description': 'Operator of some object.',
                                        'required': [
                                            '@type',
                                            'idLocal',
                                        ],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/items/properties/measurements/items/properties/@type',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Operator type',
                                                'description': 'Type of operator.',
                                            },
                                            'idLocal': {
                                                '$id': '#/properties/parameters/properties/operator/properties/idLocal',
                                                'source': null,
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                            },
                                        },
                                    },
                                    'vehicle': {
                                        '$id': '#/properties/data/properties/route/items/anyOf/0/properties/vehicle',
                                        'source': null,
                                        'type': 'object',
                                        'title': 'Vehicle',
                                        'description': 'Vehicle.',
                                        'required': [
                                            '@type',
                                            'idLocal',
                                        ],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/items/properties/measurements/items/properties/@type',
                                                'source': 'type',
                                                'default': 'Vehicle',
                                                'type': 'string',
                                                'title': 'Vehicle type',
                                                'description': 'Type of vehicle.',
                                            },
                                            'idLocal': {
                                                '$id': '#/properties/parameters/properties/vehicle/properties/idLocal',
                                                'source': 'vehicle.id',
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                            },
                                            'location': {
                                                '$id': '#/properties/data/properties/route/items/anyOf/0/properties/vehicle/properties/location',
                                                'source': null,
                                                'type': 'object',
                                                'title': 'Location',
                                                'description': 'Location describes geographical position of an object (Identity).',
                                                'required': [
                                                    '@type',
                                                ],
                                                'properties': {
                                                    '@type': {
                                                        '$id': '#/properties/data/properties/route/items/anyOf/0/properties/vehicle/properties/location/properties/%40type',
                                                        'source': 'type',
                                                        'default': 'Location',
                                                        'type': 'string',
                                                        'title': 'Location type',
                                                        'description': 'Type of location.',
                                                    },
                                                    'latitude': {
                                                        '$id': '#/properties/data/properties/route/items/anyOf/0/properties/vehicle/properties/location/properties/latitude',
                                                        'source': 'position.latitude',
                                                        'type': 'number',
                                                        'title': 'Latitude',
                                                        'description': 'The angular distance north or south from the equator of a point on the earth\'s surface, measured on the meridian of the point (WGS 84).',
                                                    },
                                                    'longitude': {
                                                        '$id': '#/properties/data/properties/route/items/anyOf/0/properties/vehicle/properties/location/properties/longitude',
                                                        'source': 'position.longitude',
                                                        'type': 'number',
                                                        'title': 'Longitude',
                                                        'description': 'Angular distance east or west on the earth\'s surface, measured by the angle contained between the meridian of a particular place and some prime meridian, as that of Greenwich, England, and expressed either in degrees or by some corresponding difference in time (WGS 84).',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        },
        'signature': {
            '$id': '#/properties/signature',
            'type': 'object',
            'title': 'Signature',
            'required': [
                'type',
                'created',
                'creator',
                'signatureValue',
            ],
            'properties': {
                'type': {
                    '$id': '#/properties/signature/properties/type',
                    'type': 'string',
                    'title': 'Signature type',
                    'examples': [
                        'RsaSignature2018',
                    ],
                },
                'created': {
                    '$id': '#/properties/signature/properties/created',
                    'type': 'string',
                    'title': 'Signature creation date and time',
                    'format': 'date-time',
                    'examples': [
                        '2018-11-22T12:00:00Z',
                    ],
                },
                'creator': {
                    '$id': '#/properties/signature/properties/creator',
                    'type': 'string',
                    'title': 'Signature creator',
                    'examples': [
                        'https://example.org/creator/public_key.pub',
                    ],
                },
                'signatureValue': {
                    '$id': '#/properties/signature/properties/signatureValue',
                    'type': 'string',
                    'title': 'Generated signature',
                    'examples': [
                        'eyJ0eXAiOiJK...gFWFOEjXk',
                    ],
                },
            },
        },
    },
};

/**
 * Transfer vehicle idLocal values to ids array.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'vehicle')) {
            if (Object.hasOwnProperty.call(parameters.vehicle, 'idLocal')) {
                parameters.ids = Array.isArray(parameters.vehicle.idLocal) ?
                    parameters.vehicle.idLocal : [parameters.vehicle.idLocal];
            }
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
            result = transformer.transform(value, schema.properties.data);
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
    name: 'nysse',
    parameters,
    output,
};
