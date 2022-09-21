'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Gurufield case transformer.
 */

// Source mapping
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/Case?v=2.0',
    'type': 'object',
    'required': [],
    'source': null,
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'type': 'string',
            'const': 'https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/Case/?v=2.0',
            'title': 'JSON-LD context url',
            'description': 'JSON-LD context url with terms required to understand data product content.',
        },
        'data': {
            '$id': '#/properties/data',
            'type': 'object',
            'title': 'Data product output',
            'description': 'Output of data product delivered to customers.',
            'required': [],
            'source': null,
            'properties': {
                'case': {
                    '$id': '#/properties/data/properties/case',
                    'type': 'array',
                    'title': '',
                    'description': '',
                    'source': '',
                    'items': {
                        '$id': '#/properties/data/properties/case/items',
                        'type': 'object',
                        'required': [],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/case/items/properties/@type',
                                'type': 'string',
                                'title': 'Type of identity.',
                                'description': 'Identity type',
                                'source': 'type',
                            },
                            'idLocal': {
                                '$id': '#/properties/data/properties/case/items/properties/idLocal',
                                'type': 'string',
                                'title': 'Local identifier',
                                'description': 'Locally given identifier.',
                                'source': 'Id',
                            },
                            'idExternal': {
                                '$id': '#/properties/data/properties/case/items/properties/idExternal',
                                'type': 'string',
                                'title': 'External system Id',
                                'description': 'External system identifier.',
                                'source': 'ExternalId',
                            },
                            'descriptionGeneral': {
                                '$id': '#/properties/data/properties/case/items/properties/descriptionGeneral',
                                'type': 'string',
                                'title': 'Description',
                                'description': 'Description.',
                                'source': 'Description',
                            },
                            'categorizationLocal': {
                                '$id': '#/properties/data/properties/case/items/properties/categorizationLocal',
                                'type': 'string',
                                'title': 'Local category',
                                'description': 'Categorisation name given locally.',
                                'source': 'CaseTypeId',
                            },
                            'categorizationLocal2': {
                                '$id': '#/properties/data/properties/case/items/properties/categorizationLocal2',
                                'type': 'string',
                                'title': 'Second local category',
                                'description': 'Additional categorization given locally (source system).',
                            },
                            'header': {
                                '$id': '#/properties/data/properties/case/items/properties/header',
                                'type': 'string',
                                'title': 'Header',
                                'description': 'Header for thing, subject or event.',
                                'source': 'Title',
                            },
                            'created': {
                                'type': 'string',
                                'title': 'Created',
                                'description': 'Creation time.',
                                'value': '${Created}',
                            },
                            'updated': {
                                'type': 'string',
                                'title': 'Update time',
                                'description': 'Last update time.',
                                'value': '${Modified}',
                            },
                            'contractor': {
                                '$id': '#/properties/data/properties/case/items/properties/contractor',
                                'type': 'object',
                                'title': '',
                                'description': '',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/case/items/properties/contractor/properties/@type',
                                        'type': 'string',
                                        'title': 'Type of identity.',
                                        'description': 'Identity type',
                                        'enum': [
                                            'Organization',
                                            'Person',
                                        ],
                                        'source': 'contractorType',
                                    },
                                    'idLocal': {
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                        'source': 'null',
                                    },
                                    'name': {
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                        'source': 'ContractorName',
                                    },
                                },
                            },
                            'status': {
                                '$id': '#/properties/data/properties/case/items/properties/status',
                                'type': 'object',
                                'title': 'Life-cycle status',
                                'description': 'Life-cycle status.  Status name.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/@type',
                                        'type': 'string',
                                        'title': 'Type of identity.',
                                        'description': 'Identity type',
                                        'enum': [
                                            'Status',
                                        ],
                                        'source': 'statusType',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/name',
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                        'source': 'StatusId',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/idLocal',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'exactTime': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/exactTime',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                        'source': 'Date',
                                    },
                                    'comment': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/comment',
                                        'type': 'string',
                                        'title': '',
                                        'description': '',
                                        'source': 'ClassifiersComment',
                                    },
                                    'descriptionGeneral': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/descriptionGeneral',
                                        'type': 'string',
                                        'title': 'Description',
                                        'description': 'Description.',
                                    },
                                    'actionRequired': {
                                        'type': 'string',
                                        'title': 'Desriptions of actions',
                                        'description': 'Actions or activities required or planned to be taken.',
                                        'value': '${InvestigationConclusions}',
                                    },
                                    'source': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/source',
                                        'type': 'object',
                                        'title': 'Source',
                                        'description': 'Source of the information.',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/case/items/properties/status/properties/source/properties/@type',
                                                'type': 'string',
                                                'title': 'Type of identity.',
                                                'description': 'Identity type',
                                                'enum': [
                                                    'Organization',
                                                    'Person',
                                                ],
                                                'source': 'sourceType',
                                            },
                                            'name': {
                                                '$id': '#/properties/data/properties/case/items/properties/status/properties/source/properties/name',
                                                'type': 'string',
                                                'title': 'Name',
                                                'description': 'Name.',
                                            },
                                            'idLocal': {
                                                '$id': '#/properties/data/properties/case/items/properties/status/properties/source/properties/idLocal',
                                                'type': 'string',
                                                'title': 'Local identifier',
                                                'description': 'Locally given identifier.',
                                                'source': 'ReportedByCompanyId',
                                            },
                                        },
                                    },
                                    'supplier': {
                                        '$id': '#/properties/data/properties/case/items/properties/status/properties/supplier',
                                        'type': 'object',
                                        'title': '',
                                        'description': '',
                                        'required': [],
                                        'properties': {
                                            '@type': {
                                                '$id': '#/properties/data/properties/case/items/properties/status/properties/supplier/properties/@type',
                                                'type': 'string',
                                                'title': 'Type of identity.',
                                                'description': 'Identity type',
                                                'enum': [
                                                    'Organization',
                                                    'Person',
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            'customer': {
                                '$id': '#/properties/data/properties/case/items/properties/customer',
                                'type': 'object',
                                'title': 'Customer',
                                'description': '',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/case/items/properties/customer/properties/@type',
                                        'type': 'string',
                                        'title': 'Type of identity.',
                                        'description': 'Identity type',
                                        'enum': [
                                            'Organization',
                                            'Person',
                                        ],
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/case/items/properties/customer/properties/name',
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/case/items/properties/customer/properties/idLocal',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                },
                            },
                            'project': {
                                '$id': '#/properties/data/properties/case/items/properties/project',
                                'type': 'object',
                                'title': '',
                                'description': '',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/case/items/properties/project/properties/@type',
                                        'type': 'string',
                                        'title': 'Type of identity.',
                                        'description': 'Identity type',
                                        'enum': [
                                            'Project',
                                        ],
                                        'source': 'projectType',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/case/items/properties/project/properties/idLocal',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                        'source': 'ProjectId',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/case/items/properties/project/properties/name',
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                    },
                                },
                            },
                            'location': {
                                '$id': '#/properties/data/properties/case/items/properties/location',
                                'type': 'object',
                                'title': 'Location',
                                'description': 'Property category for location related information.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/case/items/properties/location/properties/@type',
                                        'type': 'string',
                                        'title': 'Type of identity.',
                                        'description': 'Identity type',
                                        'enum': [
                                            'Location',
                                        ],
                                        'source': 'locationType',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/case/items/properties/location/properties/idLocal',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                        'source': 'SiteId',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/case/items/properties/location/properties/name',
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                        'source': 'Location',
                                    },
                                    'longitude': {
                                        '$id': '#/properties/data/properties/case/items/properties/location/properties/longitude',
                                        'type': 'string',
                                        'title': 'Longitude',
                                        'description': 'Angular distance east or west on the earths surface, measured by the angle contained between the meridian of a particular place and some prime meridian, as that of Greenwich, England, and expressed either in degrees or by some corresponding difference in time (WGS 84).',
                                        'source': 'Longitude',
                                    },
                                    'latitude': {
                                        '$id': '#/properties/data/properties/case/items/properties/location/properties/latitude',
                                        'type': 'string',
                                        'title': 'Latitude',
                                        'description': 'The angular distance north or south from the equator of a point on the earths surface, measured on the meridian of the point (WGS 84).',
                                        'source': 'Latitude',
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
                    'description': 'Party who has created the file or information.',
                },
                'signatureValue': {
                    '$id': '#/properties/signature/properties/signatureValue',
                    'type': 'string',
                    'title': 'Signature value',
                    'description': 'Signature value.',
                },
            },
        },
    },
    'version': '2.0',
};

// Define default pageSize if limit is not provided
const parameters = async (config, parameters) => {
    if (!Object.hasOwnProperty.call(parameters, 'limit')) {
        parameters.limit = 1000;
        return parameters;
    }
    return parameters;
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
        const key = Object.keys(schema.properties.data.properties)[0];

        for (let j = 0; j < data.length; j++) {
            let result = {};
            const value = data[j][config.output.value];
            // Transform raw input.
            value.type = 'Case';
            value.statusType = 'Status';
            value.projectType = 'Project';
            value.sourceType = 'Organization';
            value.contractorType = 'Organization';
            value.locationType = 'Location';
            value.null = null;

            result = transformer.transform(value, schema.properties.data);

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
        if (JSON.stringify(object)==='{}') {
            object = {[key]: []};
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
    try {
        // Validate type.
        if (config.parameters.targetObject['@type'] !== 'Case') {
            return output;
        }
        // Initialize harmonized output.
        const result = {
            [config.output.context]: config.output.contextValue,
            [config.output.object]: {
                [config.output.array]: [],
            },
        };

        // Hand over data objects to transformer.
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
    name: 'gurufield-case',
    parameters,
    output,
};