'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Congrid note transformer.
 */

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/Note?v=2.1',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/Note/?v=2.1',
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
                'note': {
                    '$id': '#/properties/data/properties/note',
                    'source': '',
                    'type': 'array',
                    'title': 'Note',
                    'description': 'Note.',
                    'items': {
                        '$id': '#/properties/data/properties/note/items',
                        'source': null,
                        'type': 'object',
                        'required': [],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/note/items/properties/@type',
                                'source': 'type',
                                'type': 'string',
                                'title': 'Identity type',
                                'description': 'Type of identity.',
                            },
                            'idSystemLocal': {
                                '$id': '#/properties/data/properties/note/items/properties/idSystemLocal',
                                'source': 'id',
                                'type': 'string',
                                'title': 'Source system id',
                                'description': 'Id given by source system.',
                            },
                            'idLocal': {
                                '$id': '#/properties/data/properties/note/items/properties/idLocal',
                                'source': 'displayId',
                                'type': 'string',
                                'title': 'Local identifier',
                                'description': 'Locally given identifier.',
                            },
                            'header': {
                                '$id': '#/properties/data/properties/note/items/properties/header',
                                'source': 'description',
                                'type': 'string',
                                'title': 'Header',
                                'description': 'Header for thing, subject or event.',
                            },
                            'descriptionGeneral': {
                                '$id': '#/properties/data/properties/note/items/properties/descriptionGeneral',
                                'source': 'descriptionExtended',
                                'type': 'string',
                                'title': 'Description',
                                'description': 'Description.',
                            },
                            'categorizationLocal': {
                                '$id': '#/properties/data/properties/note/items/properties/categorizationLocal',
                                'source': 'topicName',
                                'type': 'string',
                                'title': 'Local category',
                                'description': 'Categorisation name given locally.',
                            },
                            'actionRequired': {
                                '$id': '#/properties/data/properties/note/items/properties/actionRequired',
                                'source': 'requiredAction',
                                'type': 'string',
                                'title': 'Desriptions of actions',
                                'description': 'Actions or activities required or planned to be taken.',
                            },
                            'completionRequired': {
                                '$id': '#/properties/data/properties/note/items/properties/completionRequired',
                                'source': 'requiredActionDueAt',
                                'type': 'string',
                                'title': 'Completition required',
                                'description': 'Completition required (due time).',
                            },
                            'status': {
                                '$id': '#/properties/data/properties/note/items/properties/status',
                                'source': '',
                                'type': 'array',
                                'title': 'Life-cycle status',
                                'description': 'Life-cycle status.',
                                'items': {
                                    '$id': '#/properties/data/properties/note/items/properties/status/items',
                                    'source': null,
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/note/items/properties/status/items/properties/@type',
                                            'source': 'statusType',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'name': {
                                            '$id': '#/properties/data/properties/note/items/properties/status/items/properties/name',
                                            'source': 'statusId',
                                            'type': 'string',
                                            'title': 'Name',
                                            'description': 'Name.',
                                        },
                                    },
                                },
                            },
                            'categorizationLocal2': {
                                '$id': '#/properties/data/properties/note/items/properties/categorizationLocal2',
                                'source': 'noteTypeId',
                                'type': 'string',
                                'title': 'Second local category',
                                'description': 'Additional categorization given locally (source system).',
                            },
                            'categorizationLocal3': {
                                '$id': '#/properties/data/properties/note/items/properties/categorizationLocal3',
                                'source': 'noteClassId',
                                'type': 'string',
                                'title': 'Third local category',
                                'description': 'Third local category.',
                            },
                            'categorizationseverity': {
                                '$id': '#/properties/data/properties/note/items/properties/categorizationseverity',
                                'source': 'multiplier',
                                'type': 'integer',
                                'title': 'Severity category',
                                'description': 'Categorization based on severity.',
                            },
                            'categorizationLocalPriority': {
                                '$id': '#/properties/data/properties/note/items/properties/categorizationLocalPriority',
                                'source': 'priorityValue',
                                'type': 'integer',
                                'title': 'Priority class',
                                'description': 'Priority based categorization given locally.',
                            },
                            'visibleStart': {
                                '$id': '#/properties/data/properties/note/items/properties/visibleStart',
                                'source': 'visibleFromAt',
                                'type': 'string',
                                'title': 'Visibility start time',
                                'description': 'Visibility start time defines when visibility of information starts.',
                            },
                            'visibleEnd': {
                                '$id': '#/properties/data/properties/note/items/properties/visibleEnd',
                                'source': 'visibleToAt',
                                'type': 'string',
                                'title': 'Visibility end time',
                                'description': 'Visibility end time defines when visibility of information ends.',
                            },
                            'validFrom': {
                                '$id': '#/properties/data/properties/note/items/properties/validFrom',
                                'source': 'validFromAt',
                                'type': 'string',
                                'title': 'Validity period start time',
                                'description': 'Validity period start time.',
                            },
                            'validTo': {
                                '$id': '#/properties/data/properties/note/items/properties/validTo',
                                'source': 'validToAt',
                                'type': 'string',
                                'title': 'Validity period end time',
                                'description': 'Validity period end time.',
                            },
                            'actual': {
                                '$id': '#/properties/data/properties/note/items/properties/actual',
                                'source': 'observedAt',
                                'type': 'string',
                                'title': 'Actual time',
                                'description': 'Actual time.',
                            },
                            'created': {
                                '$id': '#/properties/data/properties/note/items/properties/created',
                                'source': 'createdAt',
                                'type': 'string',
                                'title': 'Created',
                                'description': 'Creation time.',
                            },
                            'updated': {
                                '$id': '#/properties/data/properties/note/items/properties/updated',
                                'source': 'modifiedAt',
                                'type': 'string',
                                'title': 'Update time',
                                'description': 'Last update time.',
                            },
                            'project': {
                                '$id': '#/properties/data/properties/note/items/properties/project',
                                'source': null,
                                'type': 'object',
                                'title': 'Project',
                                'description': 'Project.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/note/items/properties/project/properties/@type',
                                        'source': 'projectType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/note/items/properties/project/properties/idLocal',
                                        'source': 'projectId',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                },
                            },
                            'contractor': {
                                '$id': '#/properties/data/properties/note/items/properties/contractor',
                                'source': null,
                                'type': 'object',
                                'title': 'Contractor',
                                'description': 'Contractor.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/note/items/properties/contractor/properties/@type',
                                        'source': 'contractorType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/note/items/properties/contractor/properties/idLocal',
                                        'source': 'companyId',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                },
                            },
                            'process': {
                                '$id': '#/properties/data/properties/note/items/properties/process',
                                'source': null,
                                'type': 'object',
                                'title': 'Process',
                                'description': 'Process.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/note/items/properties/process/properties/@type',
                                        'source': 'processType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/note/items/properties/process/properties/idLocal',
                                        'source': 'workActivityId',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                    'idGroup': {
                                        '$id': '#/properties/data/properties/note/items/properties/process/properties/idGroup',
                                        'source': 'workSectionId',
                                        'type': 'string',
                                        'title': 'Group id',
                                        'description': 'Identifier of section/group (example work/process section).',
                                    },
                                },
                            },
                            'location': {
                                '$id': '#/properties/data/properties/note/items/properties/location',
                                'source': null,
                                'type': 'object',
                                'title': 'Location',
                                'description': 'Location.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/note/items/properties/location/properties/@type',
                                        'source': 'locationType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'ifcGuid': {
                                        '$id': '#/properties/data/properties/note/items/properties/location/properties/ifcGuid',
                                        'source': 'targetId',
                                        'type': 'string',
                                        'title': 'IFC GUID',
                                        'description': 'IFC standard based Globally Unique Identifier.',
                                    },
                                },
                            },
                            'creator': {
                                '$id': '#/properties/data/properties/note/items/properties/creator',
                                'source': null,
                                'type': 'object',
                                'title': 'Creator',
                                'description': 'Party who has created the file or information.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/note/items/properties/creator/properties/@type',
                                        'source': 'creatorType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/note/items/properties/creator/properties/idLocal',
                                        'source': 'createdBy',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                },
                            },
                            'updater': {
                                '$id': '#/properties/data/properties/note/items/properties/updater',
                                'source': null,
                                'type': 'object',
                                'title': 'Updater',
                                'description': 'Updater (updates file or information). Same as modifier.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/note/items/properties/updater/properties/@type',
                                        'source': 'updaterType',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/note/items/properties/updater/properties/idLocal',
                                        'source': 'modifiedBy',
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
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
                    'title': 'Signature value',
                    'description': 'Signature value.',
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
        const key = Object.keys(schema.properties.data.properties)[0];

        for (let j = 0; j < data.length; j++) {
            // Filter by id.
            const ids = config.parameters.ids.map(o => o.id);
            if (!ids.includes(id) && ids.length > 0) {
                continue;
            }

            let result = {};
            const value = data[j][config.output.value];
            // Transform raw input.
            value.type = 'Note';
            value.statusType = 'Status';
            value.projectType = 'Project';
            value.contractorType = 'Organization';
            value.processType = 'Process';
            value.locationType = 'Location';
            value.creatorType = 'Person';
            value.updaterType = 'Person';
            value.processType = 'Process';

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
    name: 'congrid-note',
    output,
};
