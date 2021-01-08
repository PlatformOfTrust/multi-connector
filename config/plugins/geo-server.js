'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * GeoServer.
 */

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/BuildingInformation?v=2.0',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/BuildingInformation/?v=2.0',
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
                '@type': {
                    '$id': '#/properties/data/properties/@type',
                    'source': 'dataType',
                    'type': 'string',
                    'title': 'Identity type',
                    'description': 'Type of identity.',
                },
                'idSystemLocal': {
                    '$id': '#/properties/data/properties/idSystemLocal',
                    'source': 'id',
                    'type': 'string',
                    'title': 'Source system id',
                    'description': 'Id given by source system.',
                },
                'idOfficial': {
                    '$id': '#/properties/data/properties/idOfficial',
                    'source': 'kuntarekisteri_id',
                    'type': 'string',
                    'title': 'Official identifier',
                    'description': 'Government (official authority) assigned identifier.',
                },
                'idLocal': {
                    '$id': '#/properties/data/properties/idLocal',
                    'source': 'kg_krakenn',
                    'type': 'string',
                    'title': 'Local identifier',
                    'description': 'Locally given identifier.',
                },
                'idOfficial2': {
                    '$id': '#/properties/data/properties/idOfficial2',
                    'source': 'ratu',
                    'type': 'string',
                    'title': 'Official identifier 2',
                    'description': 'Government (official authority) assigned additional identifier',
                },
                'IdOfficialPermanent': {
                    '$id': '#/properties/data/properties/IdOfficialPermanent',
                    'source': 'vtj_pr',
                    'type': 'string',
                    'title': 'Id Official Permanent',
                    'description': 'Id Official Permanent.',
                },
                'categorizationOfficial': {
                    '$id': '#/properties/data/properties/categorizationOfficial',
                    'source': 'tyyppi',
                    'type': 'string',
                    'title': 'Official categorization',
                    'description': 'Categorization based on official (governmental) classification.',
                },
                'categorizationOfficialCode': {
                    '$id': '#/properties/data/properties/categorizationOfficialCode',
                    'source': 'tyyppi_koodi',
                    'type': 'string',
                    'title': 'Official categorization code',
                    'description': 'Categorization code based on official (governmental) classification.',
                },
                'status': {
                    '$id': '#/properties/data/properties/status',
                    'source': null,
                    'type': 'object',
                    'title': 'Life-cycle status',
                    'description': 'Life-cycle status.',
                    'required': [],
                    'properties': {
                        '@type': {
                            '$id': '#/properties/data/properties/status/properties/@type',
                            'source': 'statusType',
                            'type': 'string',
                            'title': 'Identity type',
                            'description': 'Type of identity.',
                        },
                        'name': {
                            '$id': '#/properties/data/properties/status/properties/name',
                            'source': 'tila',
                            'type': 'string',
                            'title': 'Name',
                            'description': 'Name.',
                        },
                        'statusCode': {
                            '$id': '#/properties/data/properties/status/properties/statusCode',
                            'source': 'tila_koodi',
                            'type': 'integer',
                            'title': 'Life-cycle status code',
                            'description': 'Life-cycle status code.',
                        },
                    },
                },
                'volume': {
                    '$id': '#/properties/data/properties/volume',
                    'source': 'i_raktilav',
                    'type': 'integer',
                    'title': 'Volume',
                    'description': 'Volume of the object.',
                },
                'coordinateN': {
                    '$id': '#/properties/data/properties/coordinateN',
                    'source': 'i_nkoord',
                    'type': 'integer',
                    'title': 'N-coordinate',
                    'description': 'N-coordinate.',
                },
                'coordinateE': {
                    '$id': '#/properties/data/properties/coordinateE',
                    'source': 'i_ekoord',
                    'type': 'integer',
                    'title': 'E-coordinate',
                    'description': 'E-coordinate.',
                },
                'areaSquareMeter': {
                    '$id': '#/properties/data/properties/areaSquareMeter',
                    'source': 'i_kokala',
                    'type': 'integer',
                    'title': 'Area in square meters',
                    'description': 'Area measured in square meters.',
                },
                'areaSquareMeterFloorNet': {
                    '$id': '#/properties/data/properties/areaSquareMeterFloorNet',
                    'source': 'i_kerrosala',
                    'type': 'integer',
                    'title': 'Storey net square meters',
                    'description': 'Net square meters of floor space/area/storey.',
                },
                'amountStorey': {
                    '$id': '#/properties/data/properties/amountStorey',
                    'source': 'i_kerrlkm',
                    'type': 'integer',
                    'title': 'Number or storeys',
                    'description': 'Describes how many storeys the structure has.',
                },
                'areaSquareMeterBasement': {
                    '$id': '#/properties/data/properties/areaSquareMeterBasement',
                    'source': 'i_kellarala',
                    'type': 'integer',
                    'title': 'Basement area',
                    'description': 'Basement area in square meters.',
                },
                'amountApartment': {
                    '$id': '#/properties/data/properties/amountApartment',
                    'source': 'i_huoneistojen_lkm',
                    'type': 'integer',
                    'title': 'Number of apartments',
                    'description': 'Number of apartments.',
                },
                'areaSquareMeterLivingNet': {
                    '$id': '#/properties/data/properties/areaSquareMeterLivingNet',
                    'source': 'd_ashuoala',
                    'type': 'integer',
                    'title': 'Living space net square meters',
                    'description': 'Living space net square meters.',
                },
                'sewageConnectionAvailability': {
                    '$id': '#/properties/data/properties/sewageConnectionAvailability',
                    'source': 'c_viemlii',
                    'type': 'string',
                    'title': 'Sewage connection status',
                    'description': 'Describes if sewage connection is available.',
                },
                'waterConnectionAvailability': {
                    '$id': '#/properties/data/properties/waterConnectionAvailability',
                    'source': 'c_vesilii',
                    'type': 'string',
                    'title': 'Water connection status',
                    'description': 'Describes if water connection is available.',
                },
                'completed': {
                    '$id': '#/properties/data/properties/completed',
                    'source': 'c_valmpvm',
                    'type': 'string',
                    'title': 'Completion time',
                    'description': 'Completion time.',
                },
                'electricityConnectionAvailability': {
                    '$id': '#/properties/data/properties/electricityConnectionAvailability',
                    'source': 'c_sahkolii',
                    'type': 'boolean',
                    'title': 'Electricity connection status',
                    'description': 'Describes if electricity connection is available.',
                },
                'materialStructure': {
                    '$id': '#/properties/data/properties/materialStructure',
                    'source': 'c_rakeaine',
                    'type': 'string',
                    'title': 'Structure material',
                    'description': 'Main material used in structure.',
                },
                'heatingFuel': {
                    '$id': '#/properties/data/properties/heatingFuel',
                    'source': 'c_poltaine',
                    'type': 'string',
                    'title': 'Heating fuel type',
                    'description': 'Fuel type used for heating.',
                },
                'heatingMechanism': {
                    '$id': '#/properties/data/properties/heatingMechanism',
                    'source': 'c_lammtapa',
                    'type': 'string',
                    'title': 'Heating type',
                    'description': 'Heating type (Heating system type).',
                },
                'usageMain': {
                    '$id': '#/properties/data/properties/usageMain',
                    'source': 'c_kayttark',
                    'type': 'string',
                    'title': 'Main usage purpose',
                    'description': 'Main usage purpose.',
                },
                'materialVeneer': {
                    '$id': '#/properties/data/properties/materialVeneer',
                    'source': 'c_julkisivu',
                    'type': 'string',
                    'title': 'Veneer material',
                    'description': 'Main material used for veneer.',
                },
                'elevatorAvailability': {
                    '$id': '#/properties/data/properties/elevatorAvailability',
                    'source': 'c_hissi',
                    'type': 'boolean',
                    'title': 'Elevator status',
                    'description': 'Describes if elevator is available.',
                },
                'area': {
                    '$id': '#/properties/data/properties/area',
                    'source': null,
                    'type': 'object',
                    'title': 'Area size',
                    'description': 'Area size (surface area).',
                    'required': [],
                    'properties': {
                        '@type': {
                            '$id': '#/properties/data/properties/area/properties/@type',
                            'source': 'areaType',
                            'type': 'string',
                            'title': 'Identity type',
                            'description': 'Type of identity.',
                        },
                        'coordinate': {
                            '$id': '#/properties/data/properties/area/properties/coordinate',
                            'source': null,
                            'type': 'array',
                            'title': 'Coordinate',
                            'description': 'Coordinate.',
                            'items': {
                                '$id': '#/properties/data/properties/area/properties/coordinate/items',
                                'source': 'coordinates',
                                'type': 'object',
                                'required': [],
                                'properties': {
                                    'longitude': {
                                        '$id': '#/properties/data/properties/area/properties/coordinate/items/properties/longitude',
                                        'source': 0,
                                        'type': 'number',
                                        'title': 'Longitude',
                                        'description': 'Angular distance east or west on the earth\'s surface, measured by the angle contained between the meridian of a particular place and some prime meridian, as that of Greenwich, England, and expressed either in degrees or by some corresponding difference in time (WGS 84).',
                                    },
                                    'latitude': {
                                        '$id': '#/properties/data/properties/area/properties/coordinate/items/properties/latitude',
                                        'source': 1,
                                        'type': 'number',
                                        'title': 'Latitude',
                                        'description': 'The angular distance north or south from the equator of a point on the earth\'s surface, measured on the meridian of the point (WGS 84).',
                                    },
                                },
                            },
                        },
                    },
                },
                'realEstate': {
                    '$id': '#/properties/data/properties/realEstate',
                    'source': null,
                    'type': 'object',
                    'title': 'Real Estate',
                    'description': 'Real Estate.',
                    'required': [],
                    'properties': {
                        '@type': {
                            '$id': '#/properties/data/properties/realEstate/properties/@type',
                            'source': 'realEstateType',
                            'type': 'string',
                            'title': 'Identity type',
                            'description': 'Type of identity.',
                        },
                        'idOfficial': {
                            '$id': '#/properties/data/properties/realEstate/properties/idOfficial',
                            'source': 'c_kiinteistotunnus',
                            'type': 'string',
                            'title': 'Official identifier',
                            'description': 'Government (official authority) assigned identifier.',
                        },
                    },
                },
                'StreetAddress': {
                    '$id': '#/properties/data/properties/StreetAddress',
                    'source': null,
                    'type': 'object',
                    'title': 'StreetAddress',
                    'description': 'StreetAddress.',
                    'required': [],
                    'properties': {
                        '@type': {
                            '$id': '#/properties/data/properties/StreetAddress/properties/@type',
                            'source': 'streetAddressType',
                            'type': 'string',
                            'title': 'Identity type',
                            'description': 'Type of identity.',
                        },
                        'streetAddressLine1': {
                            '$id': '#/properties/data/properties/StreetAddress/properties/streetAddressLine1',
                            'source': 'katunimi_suomi',
                            'type': 'string',
                            'title': 'Street Address Line 1',
                            'description': 'Street Address Line 1.',
                        },
                        'streetAddressLine2': {
                            '$id': '#/properties/data/properties/StreetAddress/properties/streetAddressLine2',
                            'source': 'osoitenumero',
                            'type': 'string',
                            'title': 'Street Address Line 2',
                            'description': 'Street Address Line 2.',
                        },
                        'postalCode': {
                            '$id': '#/properties/data/properties/StreetAddress/properties/postalCode',
                            'source': 'postinumero',
                            'type': 'string',
                            'title': 'Postal Code',
                            'description': 'Postal Code.',
                        },
                    },
                },
                'signature': {
                    '$id': '#/properties/data/properties/signature',
                    'source': null,
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
                            'description': 'Creator.',
                        },
                        'signatureValue': {
                            '$id': '#/properties/data/properties/signature/properties/signatureValue',
                            'type': 'string',
                            'title': 'Signature Value',
                            'description': 'Signature Value.',
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
    let result = {};
    try {
        for (let j = 0; j < data.length; j++) {
            const value = data[j][config.output.value].properties;
            value.dataType = 'Building';
            value.statusType = 'Status';
            value.areaType = 'Polygon';
            value.realEstateType = 'RealEstate';
            value.streetAddressType = 'StreetAddress';
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
        parameters = {...parameters, ...(parameters.targetObject || {})};
        delete parameters.targetObject;
        return parameters;
    } catch (e) {
        return parameters;
    }
};

/**
 * Remove datetime in case period parameter is not included.
 *
 * @param {Object} config
 * @param {Object/String} request
 * @return {Object}
 */
const request = async (config, request) => {
    try {
        if (!Object.hasOwnProperty.call(config.parameters, 'period')) {
            if (Array.isArray(request.query)) {
                request.query = request.query.filter(q => !q['datetime']);
            }
        }
        return request;
    } catch (e) {
        return request;
    }
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
