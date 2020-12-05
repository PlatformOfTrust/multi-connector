'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const transformer = require('../../app/lib/transformer');

/**
 * Office 365.
 */

// Source mapping.
const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/Event?v=2.0',
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Event/?v=2.0',
            'title': 'JSON-LD context url',
            'description': 'JSON-LD context url with terms required to understand data product content.',
        },
        'data': {
            '$id': '#/properties/data',
            'source': null,
            'type': 'object',
            'title': 'Data product output',
            'description': 'Output of data product delivered to customers.',
            'required': [
                'event',
            ],
            'properties': {
                'event': {
                    '$id': '#/properties/data/properties/event',
                    'source': '',
                    'type': 'array',
                    'title': 'Event',
                    'description': 'List of Event objects.',
                    'items': {
                        '$id': '#/properties/data/properties/event/items',
                        'source': '',
                        'type': 'object',
                        'required': [
                            '@type',
                        ],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/event/items/properties/@type',
                                'type': 'string',
                                'title': 'Identity type',
                                'description': 'Type of identity.',
                            },
                            'categorizationImportance': {
                                '$id': '#/properties/data/properties/event/items/properties/categorizationImportance',
                                'source': 'importance',
                                'type': 'string',
                                'title': 'Importance category',
                                'description': 'Kategorointi joka perustuu tärkeysluokitukseen.',
                            },
                            'categorizationSensitivity': {
                                '$id': '#/properties/data/properties/event/items/properties/categorizationSensitivity',
                                'source': 'sensitivity',
                                'type': 'string',
                                'title': 'Sensitivity category',
                                'description': 'Category based on sensitivity.',
                            },
                            'categorizationRecurrence': {
                                '$id': '#/properties/data/properties/event/items/properties/categorizationRecurrence',
                                'source': 'recurrence',
                                'type': 'string',
                                'title': 'Recurrence category',
                                'description': 'Recurrence category.',
                            },
                            'header': {
                                '$id': '#/properties/data/properties/event/items/properties/header',
                                'source': 'subject',
                                'type': 'string',
                                'title': 'Header',
                                'description': 'Header for thing, subject or event.',
                            },
                            'url': {
                                '$id': '#/properties/data/properties/event/items/properties/url',
                                'source': 'webLink',
                                'type': 'string',
                                'title': 'URL address',
                                'description': 'URL address.',
                            },
                            'status': {
                                '$id': '#/properties/data/properties/event/items/properties/status',
                                'source': 'status',
                                'type': 'array',
                                'title': 'Life-cycle status',
                                'description': 'Life-cycle status',
                                'items': {
                                    '$id': '#/properties/data/properties/event/items/properties/status/items',
                                    'source': '',
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/event/items/properties/status/items/properties/@type',
                                            'source': '@type',
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'name': {
                                            '$id': '#/properties/data/properties/event/items/properties/status/items/properties/name',
                                            'source': 'name',
                                            'type': 'string',
                                            'title': 'Name',
                                            'description': 'Name.',
                                        },
                                    },
                                },
                            },
                            'eventUrl': {
                                '$id': '#/properties/data/properties/event/items/properties/eventUrl',
                                'source': 'onlineMeetingUrl',
                                'type': 'string',
                                'title': '',
                                'description': '',
                            },
                            'created': {
                                '$id': '#/properties/data/properties/event/items/properties/created',
                                'source': 'createdDateTime',
                                'type': 'string',
                                'format': 'date-time',
                                'title': 'Created',
                                'description': 'Creation time.',
                            },
                            'updated': {
                                '$id': '#/properties/data/properties/event/items/properties/updated',
                                'source': 'lastModifiedDateTime',
                                'type': 'string',
                                'format': 'date-time',
                                'title': 'Update time',
                                'description': 'Last update time.',
                            },
                            'startDateTime': {
                                '$id': '#/properties/data/properties/event/items/properties/startDateTime',
                                'source': 'start.dateTime',
                                'type': 'string',
                                'format': 'date-time',
                                'title': 'Start time',
                                'description': 'Start time.',
                            },
                            'endDateTime': {
                                '$id': '#/properties/data/properties/event/items/properties/endDateTime',
                                'source': 'end.dateTime',
                                'type': 'string',
                                'format': 'date-time',
                                'title': 'End time',
                                'description': 'End time.',
                            },
                            'location': {
                                '$id': '#/properties/data/properties/event/items/properties/location',
                                'source': null,
                                'type': 'object',
                                'title': 'Location',
                                'description': 'Property category for location related information.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/event/items/properties/location/properties/@type',
                                        'source': '@type',
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/event/items/properties/location/properties/name',
                                        'source': 'location.displayName',
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                    },
                                    'categorizationLocal': {
                                        '$id': '#/properties/data/properties/event/items/properties/location/properties/categorizationLocal',
                                        'source': 'location.locationType',
                                        'type': 'string',
                                        'title': 'Local category',
                                        'description': 'Categorisation name given locally.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/event/items/properties/location/properties/idLocal',
                                        'source': 'location.uniqueId',
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
            'title': '',
            'description': '',
            'required': [],
            'properties': {
                'type': {
                    '$id': '#/properties/signature/properties/type',
                    'type': 'string',
                    'title': '',
                    'description': '',
                },
                'created': {
                    '$id': '#/properties/signature/properties/created',
                    'type': 'string',
                    'title': 'Created',
                    'description': 'Creation time',
                },
                'creator': {
                    '$id': '#/properties/signature/properties/creator',
                    'type': 'string',
                    'title': '',
                    'description': '',
                },
                'signatureValue': {
                    '$id': '#/properties/signature/properties/signatureValue',
                    'type': 'string',
                    'title': '',
                    'description': '',
                },
            },
        },
    },
    'version': '2.0',
};

/**
 * Splits period to start and end properties and renames targetObject to ids.
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
        if (Object.hasOwnProperty.call(parameters, 'targetObject')) {
            if (Array.isArray(parameters.targetObject)) {
                parameters.ids = parameters.targetObject;
            } else {
                parameters.ids = [parameters.targetObject];
            }
            delete parameters.targetObject;
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
            value['@type'] = 'Location';
            value['status'] = [];
            if (value.isCancelled) {
                value['status'].push(
                    {
                        '@type': 'Status',
                        'name': 'Cancelled',
                    },
                );
            }
            if (value.isSent) {
                value['status'].push(
                    {
                        '@type': 'Status',
                        'name': 'Sent',
                    },
                );
            }
            if (value.isDraft) {
                value['status'].push(
                    {
                        '@type': 'Status',
                        'name': 'Draft',
                    },
                );
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
 * Filters received documents by id.
 *
 * @param {Object} config
 * @param {Object/String} res
 * @return {Object}
 */
const response = async (config, res) => {
    try {
        if (Object.hasOwnProperty.call(config.parameters, 'ids')) {
            if (Array.isArray(config.parameters.ids)) {
                const ids = config.parameters.ids.map(o => o.id);
                const dataObjectKey = config.dataObjects[0];
                const idPath = Object.values(config.generalConfig.hardwareId)[0];
                res[dataObjectKey] = res[dataObjectKey].filter(o => ids.includes(_.get(o, idPath)));
            }
        }
        return res;
    } catch (e) {
        return res;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'office365',
    parameters,
    response,
    output,
};
