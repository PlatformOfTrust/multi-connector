'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');

/**
 * Finavia flight transformer.
 */

// Source mapping.
const schema = {
	'$schema': 'http://json-schema.org/draft-06/schema#',
	'$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/VehicleInformation/FlightDeparture?v=2.0',
    'source': null,
	'type': 'object',
	'required': [],
	'properties': {
		'@context': {
			'$id': '#/properties/@context',
            'source': null,
			'type': 'string',
			'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/VehicleInformation/FlightDeparture/?v=2.0',
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
				'flightDeparture': {
					'$id': '#/properties/data/properties/flightDeparture',
                    'source': '',
					'type': 'array',
					'title': 'Flight departure',
					'description': 'Flight departure.',
					'items': {
						'$id': '#/properties/data/properties/flightDeparture/items',
                        'source': null,
						'type': 'object',
						'required': [],
						'properties': {
							'@type': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/@type',
                                'source': 'type',
								'type': 'string',
								'title': 'Identity type',
								'description': 'Type of identity.'
							},
							'systemTimestamp': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/systemTimestamp',
                                'source': 'header.timestamp',
								'type': 'string',
								'title': 'System time stamp',
								'description': 'System time stamp deriving typically from computer system.  Time when record (file) was created.'
							},
							'source': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/source',
                                'source': 'header.from',
								'type': 'string',
								'title': 'Source',
								'description': 'Source of the information.'
							},
							'station': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/station',
                                'source': null,
								'type': 'object',
								'title': 'Station',
								'description': 'Station.',
								'required': [],
								'properties': {
									'@type': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/station/properties/@type',
                                        'source': 'stationType',
										'type': 'string',
										'title': 'Identity type',
										'description': 'Type of identity.'
									},
									'idOfficial': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/station/properties/idOfficial',
                                        'source': 'h_apt',
										'type': 'string',
										'title': 'Official identifier',
										'description': 'Government (official authority) assigned identifier.'
									}
								}
							},
							'transportationRoute': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationRoute',
                                'source': '',
								'type': 'array',
								'title': 'Transportation Route',
								'description': 'A transportation route is the regular path that is followed by a movement of people or goods.',
								'items': {
									'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationRoute/items',
                                    'source': null,
									'type': 'object',
									'required': [],
									'properties': {
										'@type': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationRoute/items/properties/@type',
                                            'source': 'transportationRouteType',
											'type': 'string',
											'title': 'Identity type',
											'description': 'Type of identity.'
										},
										'idOfficial': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationRoute/items/properties/idOfficial',
                                            'source': 'fltnr',
											'type': 'string',
											'title': 'Official identifier',
											'description': 'Government (official authority) assigned identifier.'
										},
										'idOfficialMaster': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationRoute/items/properties/idOfficialMaster',
                                            'source': 'mfltnr',
											'type': 'string',
											'title': 'Master Identifier (official)',
											'description': 'Identifier provided by some authority (Ofiical) for master id in case there is multiple identifiers.'
										},
										'idOfficialAlternative': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationRoute/items/properties/idOfficialAlternative',
                                            'source': 'cflight_1',
											'type': 'string',
											'title': 'Alternative official identifier',
											'description': 'Alternative official identifier.'
										}
									}
								}
							},
							'destination1': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/destination1',
                                'source': null,
								'type': 'object',
								'title': 'Destiantion 1',
								'description': 'Destiantion 1.',
								'required': [],
								'properties': {
									'@type': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination1/properties/@type',
                                        'source': 'destination1Type',
										'type': 'string',
										'title': 'Identity type',
										'description': 'Type of identity.'
									},
									'idOfficial': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination1/properties/idOfficial',
                                        'source': 'route_1',
										'type': 'string',
										'title': 'Official identifier',
										'description': 'Government (official authority) assigned identifier.'
									},
									'name': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination1/properties/name',
                                        'source': 'route_n_1',
										'type': 'string',
										'title': 'Name',
										'description': 'Name.'
									},
									'language': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination1/properties/language',
                                        'source': null,
										'type': 'string',
										'title': 'Language',
										'description': 'Language.'
									}
								}
							},
							'destination2': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/destination2',
                                'source': null,
								'type': 'object',
								'title': 'Destiantion 2',
								'description': 'Destiantion 2.',
								'required': [],
								'properties': {
									'@type': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination2/properties/@type',
                                        'source': 'destination2Type',
										'type': 'string',
										'title': 'Identity type',
										'description': 'Type of identity.'
									},
									'idOfficial': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination2/properties/idOfficial',
                                        'source': 'route_2',
										'type': 'string',
										'title': 'Official identifier',
										'description': 'Government (official authority) assigned identifier.'
									}
								}
							},
							'destination3': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/destination3',
                                'source': null,
								'type': 'object',
								'title': 'Destiantion 3',
								'description': 'Destiantion 3.',
								'required': [],
								'properties': {
									'@type': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination3/properties/@type',
                                        'source': 'destination3Type',
										'type': 'string',
										'title': 'Identity type',
										'description': 'Type of identity.'
									},
									'idOfficial': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination3/properties/idOfficial',
                                        'source': 'route_3',
										'type': 'string',
										'title': 'Official identifier',
										'description': 'Government (official authority) assigned identifier.'
									}
								}
							},
							'destination4': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/destination4',
                                'source': null,
								'type': 'object',
								'title': 'Destiantion 4',
								'description': 'Destiantion 4.',
								'required': [],
								'properties': {
									'@type': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination4/properties/@type',
                                        'source': 'destination4Type',
										'type': 'string',
										'title': 'Identity type',
										'description': 'Type of identity.'
									},
									'idOfficial': {
										'$id': '#/properties/data/properties/flightDeparture/items/properties/destination4/properties/idOfficial',
                                        'source': 'route_4',
										'type': 'string',
										'title': 'Official identifier',
										'description': 'Government (official authority) assigned identifier.'
									}
								}
							},
							'transportationTrip': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip',
                                'source': '',
								'type': 'array',
								'title': 'Transportation Trip',
								'description': 'Transportation trip is specific occasion which occurs typically on transportation route.  Typically transporation route has scheduled transportation trips.',
								'items': {
									'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items',
                                    'source': null,
									'type': 'object',
									'required': [],
									'properties': {
										'@type': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/@type',
                                            'source': 'transportationTripType',
											'type': 'string',
											'title': 'Identity type',
											'description': 'Type of identity.'
										},
										'scheduled': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/scheduled',
                                            'source': 'sdt',
											'type': 'string',
											'title': 'Scheduled time',
											'description': 'Scheduled time.'
										},
										'estimated': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/estimated',
                                            'source': 'est_d',
											'type': 'string',
											'title': 'Estimated time',
											'description': 'Estimated time.'
										},
										'estimatedPublic': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/estimatedPublic',
                                            'source': 'pest_d',
											'type': 'string',
											'title': 'Public estimated time',
											'description': 'Estimated time which is made publicly available.'
										},
										'actual': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/actual',
                                            'source': 'act_d',
											'type': 'string',
											'title': 'Actual time',
											'description': 'Actual time.'
										},
										'actualBlock': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/actualBlock',
                                            'source': 'ablk_d',
											'type': 'string',
											'title': 'Actual block time',
											'description': 'Actual block time.'
										},
										'checkIn': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/checkIn',
                                            'source': '',
											'type': 'array',
											'title': 'Check in',
											'description': 'Check in.',
											'items': {
												'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/checkIn/items',
                                                'source': null,
												'type': 'object',
												'required': [],
												'properties': {
													'@type': {
														'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/checkIn/items/properties/@type',
                                                        'source': 'transportationTripCheckInType',
														'type': 'string',
														'title': 'Identity type',
														'description': 'Type of identity.'
													},
													'nameArea': {
														'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/checkIn/items/properties/nameArea',
                                                        'source': 'chkarea',
														'type': 'string',
														'title': 'Area name',
														'description': 'Area name.'
													},
													'idLocal': {
														'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/checkIn/items/properties/idLocal',
                                                        'source': 'chkdsk_1',
														'type': 'string',
														'title': 'Local identifier',
														'description': 'Locally given identifier.'
													}
												}
											}
										},
										'status': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/status',
                                            'source': '',
											'type': 'array',
											'title': 'Life-cycle status',
											'description': 'Life-cycle status.',
											'items': {
												'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/status/items',
                                                'source': null,
												'type': 'object',
												'required': [],
												'properties': {
													'@type': {
														'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/status/items/properties/@type',
                                                        'source': 'transportationTripStatusType',
														'type': 'string',
														'title': 'Identity type',
														'description': 'Type of identity.'
													},
													'actual': {
														'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/status/items/properties/actual',
                                                        'source': 'calls_1',
														'type': 'string',
														'title': 'Actual time',
														'description': 'Actual time.'
													},
													'name': {
														'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/status/items/properties/name',
                                                        'source': null,
														'type': 'string',
														'title': 'Name',
														'description': 'Name.'
													}
												}
											}
										},
										'parkingPlace': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/parkingPlace',
                                            'source': null,
											'type': 'object',
											'title': 'Parking place',
											'description': 'Parking place.',
											'required': [],
											'properties': {
												'@type': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/parkingPlace/properties/@type',
                                                    'source': 'transportationTripParkingPlaceType',
													'type': 'string',
													'title': 'Identity type',
													'description': 'Type of identity.'
												},
												'idLocal': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/parkingPlace/properties/idLocal',
                                                    'source': 'park',
													'type': 'string',
													'title': 'Local identifier',
													'description': 'Locally given identifier.'
												}
											}
										},
										'parkingPlacePrevious': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/parkingPlacePrevious',
                                            'source': null,
											'type': 'object',
											'title': 'Previous parking place',
											'description': 'Previous parking place.',
											'required': [],
											'properties': {
												'@type': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/parkingPlacePrevious/properties/@type',
                                                    'source': 'transportationTripParkingPlacePreviousType',
													'type': 'string',
													'title': 'Identity type',
													'description': 'Type of identity.'
												},
												'idLocal': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/parkingPlacePrevious/properties/idLocal',
                                                    'source': 'park_prv',
													'type': 'string',
													'title': 'Local identifier',
													'description': 'Locally given identifier.'
												}
											}
										},
										'gate': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/gate',
                                            'source': null,
											'type': 'object',
											'title': 'Gate',
											'description': 'Gate (for example  at airport).',
											'required': [],
											'properties': {
												'@type': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/gate/properties/@type',
                                                    'source': 'transportationTripGateType',
													'type': 'string',
													'title': 'Identity type',
													'description': 'Type of identity.'
												},
												'idLocal': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/gate/properties/idLocal',
                                                    'source': 'gate',
													'type': 'string',
													'title': 'Local identifier',
													'description': 'Locally given identifier.'
												}
											}
										},
										'gatePrevious': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/gatePrevious',
                                            'source': null,
											'type': 'object',
											'title': 'Previous gate',
											'description': 'Previous gate.',
											'required': [],
											'properties': {
												'@type': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/gatePrevious/properties/@type',
                                                    'source': 'transportationTripGatePreviousType',
													'type': 'string',
													'title': 'Identity type',
													'description': 'Type of identity.'
												},
												'idLocal': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/gatePrevious/properties/idLocal',
                                                    'source': 'gate_prv',
													'type': 'string',
													'title': 'Local identifier',
													'description': 'Locally given identifier.'
												}
											}
										},
										'vehicle': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/vehicle',
                                            'source': null,
											'type': 'object',
											'title': 'Vehicle',
											'description': 'A vehicle is a machine that transports people or cargo. Vehicles include wagons, bicycles, motor vehicles (motorcycles, cars, trucks, buses), railed vehicles (trains, trams), watercraft (ships, boats), amphibious vehicles (screw-propelled vehicle, hovercraft), aircraft (airplanes, helicopters) and spacecraft.',
											'required': [],
											'properties': {
												'@type': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/vehicle/properties/@type',
                                                    'source': 'transportationTripVehicleType',
													'type': 'string',
													'title': 'Identity type',
													'description': 'Type of identity.'
												},
												'idOfficial': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/vehicle/properties/idOfficial',
                                                    'source': 'acreg',
													'type': 'string',
													'title': 'Official identifier',
													'description': 'Government (official authority) assigned identifier.'
												},
												'categorizationLocal': {
													'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/vehicle/properties/categorizationLocal',
                                                    'source': 'actype',
													'type': 'string',
													'title': 'Local category',
													'description': 'Categorisation name given locally.'
												}
											}
										},
										'idCallSign': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/transportationTrip/items/properties/idCallSign',
                                            'source': 'callsign',
											'type': 'string',
											'title': 'Call Sign',
											'description': 'Maritime call signs are call signs assigned as unique identifiers to ships and boats. All radio transmissions must be individually identified by the call sign. Merchant and naval vessels are assigned call signs by their national licensing authorities.'
										}
									}
								}
							},
							'status': {
								'$id': '#/properties/data/properties/flightDeparture/items/properties/status',
                                'source': '',
								'type': 'array',
								'title': 'Life-cycle status',
								'description': 'Life-cycle status.',
								'items': {
									'$id': '#/properties/data/properties/flightDeparture/items/properties/status/items',
                                    'source': null,
									'type': 'object',
									'required': [],
									'properties': {
										'@type': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/status/items/properties/@type',
                                            'source': 'statusType',
											'type': 'string',
											'title': 'Identity type',
											'description': 'Type of identity.'
										},
										'name': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/status/items/properties/name',
                                            'source': 'prm',
											'type': 'string',
											'title': 'Name',
											'description': 'Name.'
										},
										'language': {
											'$id': '#/properties/data/properties/flightDeparture/items/properties/status/items/properties/language',
                                            'source': 'prt',
											'type': 'string',
											'title': 'Language',
											'description': 'Language.'
										}
									}
								}
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
            console.log(config.parameters)
            let result = {};
            const value = data[j][config.output.value];
            // Transform raw input.
            value.type = 'departure';
            value.stationType = 'Airport';
            value.transportationRouteType = 'TransportationRoute';
            value.destination1Type = 'location';
            value.destination2Type = 'location';
            value.destination3Type = 'location';
            value.destination4Type = 'location';
            value.transportationTripType = 'TransportationTrip';
            value.transportationTripCheckInType = 'location';
            value.transportationTripStatusType = 'Status';
            value.transportationTripParkingPlaceType = 'ParkingPlace';
            value.transportationTripParkingPlacePreviousType = 'ParkingPlace';
            value.transportationTripGateType = 'Gate';
            value.transportationTripGatePreviousType = 'Gate';
            value.transportationTripVehicleType = 'Aircraft';
            value.statusType = 'Status';

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

const template = async (config, template) => {
    try {
        template.plugins = template.plugins.sort((a, b) => b.name.localeCompare(a.name))
    } catch (err) {
        return template;
    }
    return template;
};

const response = async (config, res) => {
    try {
        res.flights.arr.body.flight = res.flights.arr.body.flight.map((f) => { return {header: res.flights.arr.header, ...f}})
        res.flights.dep.body.flight = res.flights.dep.body.flight.map((f) => { return {header: res.flights.dep.header, ...f}})
    } catch (err) {
        return res;
    }
    return res;
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
    name: 'finavia-flight',
    template,
    response,
    output,
};
