'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const rest = require('../../app/protocols/rest');

/**
 * Digitraffic port call transformer.
 */

// Source mapping.
const schema = {
	'$schema': 'http://json-schema.org/draft-07/schema',
	'$id': 'https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/Process?v=2.0',
	'suorce': null,
    'type': 'object',
	'title': 'Data product output core schema',
	'description': 'Core schema for general data product output.',
	'required': [
		'@context',
		'data',
		'signature'
	],
	'properties': {
		'@context': {
			'$id': '#/properties/@context',
            'source': null,
			'type': 'string',
			'title': 'JSON-LD context url',
			'description': 'JSON-LD context url with terms required to understand data product content.',
			'const': 'https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/Process/?v=2.0'
		},
		'data': {
			'$id': '#/properties/data',
            'source': null,
			'type': 'object',
			'title': 'Data product output',
			'description': 'Output of data product delivered to customers.',
            'properties': {
                'process': {
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
                            'idLocal': {
                                '$id': '#/properties/data/properties/note/items/properties/idLocal',
                                'source': 'airport',
                                'type': 'string',
                                'title': 'Local identifier',
                                'description': 'Locally given identifier.',
                            },
                        }
                    }
                }
            }
        },
		'signature': {
			'$id': '#/properties/signature',
			'type': 'object',
			'title': 'Signature',
			'required': [
				'type',
				'created',
				'creator',
				'signatureValue'
			],
			'properties': {
				'type': {
					'$id': '#/properties/signature/properties/type',
					'type': 'string',
					'title': 'Signature type',
					'examples': [
						'RsaSignature2018'
					]
				},
				'created': {
					'$id': '#/properties/signature/properties/created',
					'type': 'string',
					'title': 'Signature creation date and time',
					'format': 'date-time',
					'examples': [
						'2018-11-22T12:00:00Z'
					]
				},
				'creator': {
					'$id': '#/properties/signature/properties/creator',
					'type': 'string',
					'title': 'Signature creator',
					'examples': [
						'https://example.org/creator/public_key.pub'
					]
				},
				'signatureValue': {
					'$id': '#/properties/signature/properties/signatureValue',
					'type': 'string',
					'title': 'Generated signature',
					'examples': [
						'eyJ0eXAiOiJK...gFWFOEjXk'
					]
				}
			}
		}
	},
	'version': '2.0'
};

const onerror = async (config, err) => {
    // TODO: handle 400 error.
    const from = new Date().getTime()-60*60*1000
    config.authConfig.path += '?from=' + new Date(from).toISOString()
    return rest.getData(config, [config.authConfig.path])
}

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
            value.type = 'Process';

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
    return output
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
    name: 'digitraffic-port-call',
    output,
    onerror
};
