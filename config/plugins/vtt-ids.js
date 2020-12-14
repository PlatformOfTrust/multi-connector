'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * VTT-IDS.
 */

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/Process/Measure/Traffic?v=2.0',
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Process/Measure/Traffic/?v=2.0',
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
                'traffic': {
                    '$id': '#/properties/data/properties/traffic',
                    'source': '',
                    'type': 'array',
                    'title': 'Traffic',
                    'description': 'Traffic data.',
                    'items': {
                        '$id': '#/properties/data/properties/traffic/items',
                        'source':  '',
                        'type': 'object',
                        'required': [],
                        'properties': {
                            'vehicle': {
                                '$id': '#/properties/data/properties/traffic/items/properties/vehicle',
                                'source': 'vehicle',
                                'type': 'array',
                                'title': 'Vehicle',
                                'description': 'Vehicle data.',
                                'items': {
                                    '$id': '#/properties/data/properties/traffic/items/properties/vehicle/items',
                                    'source': null,
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/traffic/items/properties/vehicle/items/properties/@type',
                                            'source': '@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'measurement': {
                                            '$id': '#/properties/data/properties/traffic/items/properties/vehicle/items/properties/measurement',
                                            'source': 'measurement',
                                            'type': 'array',
                                            'title': 'Measurement',
                                            'description': 'Measurment history data.',
                                            'items': {
                                                '$id': '#/properties/data/properties/traffic/items/properties/vehicle/items/properties/measurement/items',
                                                'source': 'measurement',
                                                'type': 'object',
                                                'required': [],
                                                'properties': {
                                                    '@type': {
                                                        '$id': '#/properties/data/properties/traffic/items/properties/vehicle/items/properties/measurement/items/properties/@type',
                                                        'source': '@type',
                                                        'type': 'string',
                                                        'title': 'Identity type',
                                                        'description': 'Type of identity.',
                                                    },
                                                    'value': {
                                                        '$id': '#/properties/data/properties/traffic/items/properties/vehicle/items/properties/measurement/items/properties/value',
                                                        'source': 'value',
                                                        'type': 'number',
                                                        'title': 'Measurment value',
                                                        'description': 'Measurment value.',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            'period': {
                                '$id': '#/properties/data/properties/traffic/items/properties/period',
                                'source': 'period',
                                'type': 'string',
                                'title': 'Period',
                                'description': 'Period.',
                            },
                            'targetObject': {
                                '$id': '#/properties/data/properties/traffic/items/properties/targetObject',
                                'source': null,
                                'type': 'object',
                                'title': 'Target object',
                                'description': 'Target object.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/traffic/items/properties/targetObject/properties/@type',
                                        'source': 'inputParameterType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'lowLeftCornerCoordinateAxis1': {
                                        '$id': '#/properties/data/properties/traffic/items/properties/targetObject/properties/lowLeftCornerCoordinateAxis1',
                                        'source': 'boundingBox.lowleft_corner.latitude',
                                        'type': 'number',
                                        'title': 'Low left corner coordinate axis 1',
                                        'description': 'Low left corner coordinate axis 1.',
                                    },
                                    'lowLeftCornerCoordinateAxis2': {
                                        '$id': '#/properties/data/properties/traffic/items/properties/targetObject/properties/lowLeftCornerCoordinateAxis2',
                                        'source': 'boundingBox.lowleft_corner.longitude',
                                        'type': 'number',
                                        'title': 'Low left corner coordinate axis 2',
                                        'description': 'Low left corner coordinate axis 2.',
                                    },
                                    'upperRightCornerCoordinateAxis1': {
                                        '$id': '#/properties/data/properties/traffic/items/properties/targetObject/properties/upperRightCornerCoordinateAxis1',
                                        'source': 'boundingBox.upright_corner.latitude',
                                        'type': 'number',
                                        'title': 'Upper right corner coordinate axis 1',
                                        'description': 'Upper right corner coordinate axis 1.',
                                    },
                                    'upperRightCornerCoordinateAxis2': {
                                        '$id': '#/properties/data/properties/traffic/items/properties/targetObject/properties/upperRightCornerCoordinateAxis2',
                                        'source': 'boundingBox.upright_corner.longitude',
                                        'type': 'number',
                                        'title': 'Upper right corner coordinate axis 2',
                                        'description': 'Upper right corner coordinate axis 2.',
                                    },
                                    'coordinateReferenceSystem': {
                                        '$id': '#/properties/data/properties/traffic/items/properties/targetObject/properties/coordinateReferenceSystem',
                                        'source': 'inputParameterRefSystem',
                                        'type': 'string',
                                        'title': 'Coordinate reference system',
                                        'description': 'Coordinate reference system.',
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
                    'title': 'Signature Value',
                    'description': 'Signature Value.',
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
            const vehicle = [];

            // Prepare data for transformation.
            try {
                if (Object.hasOwnProperty.call(value, 'busdata')) {
                    vehicle.push({
                        '@type': 'Bus',
                        'measurement': [
                            {
                                '@type': 'CountTransportationRoute',
                                'value': value.busdata['routes'],
                            },
                            {
                                '@type': 'CountTransportationTrip',
                                'value': value.busdata['trips'],
                            },
                            {
                                '@type': 'CountMeter',
                                'value': value.busdata['driven meters'],
                            },
                            {
                                '@type': 'MeasureCO2Level',
                                'value': value.busdata['Co2_emission (g)'],
                            },
                            {
                                '@type': 'MeasureEnergyKwh',
                                'value': value.busdata['energy_consumption (kWh)'],
                            },
                        ],
                    });
                }

                if (Object.hasOwnProperty.call(value, 'tramdata')) {
                    vehicle.push({
                        '@type': 'Tram',
                        'measurement': [
                            {
                                '@type': 'CountTransportationRoute',
                                'value': value.tramdata['routes'],
                            },
                            {
                                '@type': 'CountTransportationTrip',
                                'value': value.tramdata['trips'],
                            },
                            {
                                '@type': 'CountMeter',
                                'value': value.tramdata['driven meters'],
                            },
                            {
                                '@type': 'MeasureCO2Level',
                                'value': value.tramdata['Co2_emission (g)'],
                            },
                            {
                                '@type': 'MeasureEnergyKwh',
                                'value': value.tramdata['energy_consumption (kWh)'],
                            },
                        ],
                    });
                }

                value.vehicle = [...vehicle];
                value.inputParameterType = 'BoundingBox';
                value.inputParameterRefSystem = 'WGS84';
                value.period =
                    new Date(value.timeframe.start_time).toISOString() +
                    '/' +
                    new Date(value.timeframe.stop_time).toISOString();
            } catch (e) {
                console.log(e.message);
            }

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
 * Splits period to start and end properties and moves targetObject properties.
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
            delete parameters.period;
        }
        parameters = {...parameters, ...(parameters.targetObject || {})};
        delete parameters.targetObject;
        return parameters;
    } catch (e) {
        return parameters;
    }
};

/**
 * Formats date to YYYY-MM-DD.
 *
 * @param {Date} date
 * @return {String}
 */
function formatDate (date) {
    return date.slice(0, 19);
}

/**
 * Converts timestamps.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    try {
        const query = options.query;
        /** Timestamp conversion. */
        for (let i = 0; i < query.length; i++) {
            if (Object.keys(query[i])[0] === 'start'
                || Object.keys(query[i])[0] === 'stop') {
                query[i][Object.keys(query[i])[0]] = formatDate(Object.values(query[i])[0]);
            }
        }
    } catch (err) {
        return options;
    }
    return options;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'vtt-ids',
    parameters,
    request,
    output,
};
