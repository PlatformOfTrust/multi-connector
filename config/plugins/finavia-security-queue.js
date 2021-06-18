'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Finavia security queue transformer.
 */

// Source mapping.
const schema = {
	'$schema': 'http://json-schema.org/draft-06/schema#',
	'$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/Process/Measure/AirportSecurityLine/?v=2.0',
    'source': null,
	'type': 'object',
	'required': [],
	'properties': {
		'@context': {
			'$id': '#/properties/@context',
            'source': null,
			'type': 'string',
			'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/VehicleInformation/AirportSecurityLine/?v=2.0',
			'title': 'JSON-LD context url',
			'description': 'JSON-LD context url with terms required to understand data product content.'
		},
		'data': {
			'$id': '#/properties/data',
            'source': null,
			'type': 'object',
			'title': 'Data product output',
			'description': 'Output of data product delivered to customers.',
			'required': [],
			'properties': {
				'airportSecurityLine': {
					'$id': '#/properties/data/properties/airportSecurityLine',
                    'source': '',
					'type': 'array',
					'title': 'Airport security line',
					'description': 'Airport security line.',
					'items': {
						'$id': '#/properties/data/properties/airportSecurityLine/items',
                        'source': null,
						'type': 'object',
						'required': [],
						'properties': {
							'@type': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/@type',
                                'source': 'type',
								'type': 'string',
								'title': 'Identity type',
								'description': 'Type of identity.'
							},
							'processValue': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/processValue',
                                'source': 'dwellTimeInSeconds',
								'type': 'integer',
								'title': 'Output value',
								'description': 'Output value of the process.'
							},
							'exactTime': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/exactTime',
                                'source': 'lastUpdate',
								'type': 'string',
								'title': 'Exact time',
								'description': 'Exact time.'
							},
							'sampleAmount': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/sampleAmount',
                                'source': 'sampleCount',
								'type': 'integer',
								'title': 'Sample amount',
								'description': 'Sample amount (amount of samples).'
							},
							'location': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location',
                                'source': null,
								'type': 'object',
								'title': 'Location',
								'description': 'Location.',
								'required': [],
								'properties': {
									'@type': {
										'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/@type',
                                        'source': 'locationType',
										'type': 'string',
										'title': 'Identity type',
										'description': 'Type of identity.'
									},
									'idLocal': {
										'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/idLocal',
                                        'source': 'locationId',
										'type': 'string',
										'title': 'Local identifier',
										'description': 'Locally given identifier.'
									},
									'location': {
										'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location',
                                        'source': null,
										'type': 'object',
										'title': 'Location',
										'description': 'Location.',
										'required': [],
										'properties': {
											'@type': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/@type',
                                                'source': 'locationLocationType',
												'type': 'string',
												'title': 'Identity type',
												'description': 'Type of identity.'
											},
											'name': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/name',
                                                'source': 'locationArea',
												'type': 'string',
												'title': 'Name',
												'description': 'Name.'
											},
											'location': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/location',
                                                'source': null,
												'type': 'object',
												'title': 'Location',
												'description': 'Location.',
												'required': [],
												'properties': {
													'@type': {
														'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/location/properties/@type',
                                                        'source': 'locationLocationLocationType',
														'type': 'string',
														'title': 'Identity type',
														'description': 'Type of identity.'
													},
													'idOfficial': {
														'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/location/properties/idOfficial',
                                                        'source': 'airport',
														'type': 'string',
														'title': 'Official identifier',
														'description': 'Government (official authority) assigned identifier.'
													},
													'categorizationPreferred': {
														'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/location/properties/CateforizationPreferred',
                                                        'source': 'preferred',
														'type': 'boolean',
														'title': 'Categorization preffered',
														'description': 'Categorization preffered.'
													},
													'categorizationPremium:': {
														'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/location/properties/location/properties/categorizationPremium:',
                                                        'source': 'premium',
														'type': 'boolean',
														'title': 'Categorization premium',
														'description': 'Categorization premium.'
													}
												}
											}
										}
									},
									'localizationValue': {
										'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/localizationValue',
                                        'source': null,
										'type': 'object',
										'title': 'Localization',
										'description': 'Localization.',
										'required': [],
										'properties': {
											'@type': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/localizationValue/properties/@type',
                                                'source': 'locationLocalizationValueType',
												'type': 'string',
												'title': 'Identity type',
												'description': 'Type of identity.'
											},
											'propertyName': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/localizationValue/properties/propertyName',
                                                'source': null,
												'type': 'string',
												'title': 'Property name',
												'description': 'Name of the property.'
											},
											'en-us': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/localizationValue/properties/en-us',
                                                'source': 'locationName.en',
												'type': 'string',
												'title': 'English (American English)',
												'description': 'English (American English).'
											},
											'fi-fi': {
												'$id': '#/properties/data/properties/airportSecurityLine/items/properties/location/properties/localizationValue/properties/fi-fi',
                                                'source': 'locationName.fi',
												'type': 'string',
												'title': 'Finnish',
												'description': 'Finnish.'
											}
										}
									}
								}
							},
							'targetObject': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/targetObject',
                                'source': null,
								'type': 'string',
								'enum': [
									'Line'
								],
								'title': 'Target object',
								'description': 'Target object.'
							},
							'physicalProperty': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/physicalProperty',
                                'source': null,
								'type': 'string',
								'enum': [
									'PassengerProcessingTime'
								],
								'title': 'Physical property',
								'description': 'Physical property.'
							},
							'unitOfMeasure': {
								'$id': '#/properties/data/properties/airportSecurityLine/items/properties/unitOfMeasure',
                                'source': null,
								'type': 'string',
								'enum': [
									'Second'
								],
								'title': 'Unit of measure',
								'description': 'Unit of measure.'
							}
						}
					}
				}
			}
		},
		'signature': {
			'$id': '#/properties/signature',
            'source': null,
			'type': 'object',
			'title': 'Signature',
			'description': 'Signature.',
			'required': [],
			'properties': {
				'type': {
					'$id': '#/properties/signature/properties/type',
                    'source': null,
					'type': 'string',
					'title': 'Type',
					'description': 'Type.'
				},
				'created': {
					'$id': '#/properties/signature/properties/created',
                    'source': null,
					'type': 'string',
					'title': 'Created',
					'description': 'Creation time.'
				},
				'creator': {
					'$id': '#/properties/signature/properties/creator',
                    'source': null,
					'type': 'string',
					'title': 'Creator',
					'description': 'Party who has created the file or information.'
				},
				'signatureValue': {
					'$id': '#/properties/signature/properties/signatureValue',
                    'source': null,
					'type': 'string',
					'title': 'Signature value',
					'description': 'Signature value.'
				}
			}
		}
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
        const key = Object.keys(schema.properties.data.properties)[0];

        for (let j = 0; j < data.length; j++) {
            // Filter by id.
            const ids = config.parameters.targetObject.idLocal;
            if (!ids.includes(id) && ids.length > 0) {
                continue;
            }

            let result = {};
            const value = data[j][config.output.value];
            // Transform raw input.
            value.type = 'Measure';
            value.locationType = 'SecurityCheckPoint';
            value.locationLocationType = 'Terminal';
            value.locationLocationLocationType = 'Airport';
            value.locationLocalizationValueType = 'Localization';

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
    name: 'finavia-security-queue',
    output,
};
