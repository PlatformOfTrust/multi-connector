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
	"$schema": "http://json-schema.org/draft-06/schema#",
	"$id": "https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/VehicleInformation/PortCallReport?v=2.0",
	"type": "object",
	"required": [],
	"properties": {
		"@context": {
			"$id": "#/properties/@context",
			"type": "string",
			"const": "https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/VehicleInformation/PortCallReport/?v=2.0",
			"title": "JSON-LD context url",
			"description": "JSON-LD context url with terms required to understand data product content."
		},
		"data": {
			"$id": "#/properties/data",
			"type": "object",
			"title": "",
			"description": "",
			"required": [],
			"properties": {
				"portCallReport": {
					"$id": "#/properties/data/properties/portCallReport",
					"type": "array",
					"title": "Port Call Report",
					"description": "Port Call Report.",
					"items": {
						"$id": "#/properties/data/properties/portCallReport/items",
						"type": "object",
						"required": [],
						"properties": {
							"transportationTripStop": {
								"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop",
								"type": "object",
								"title": "Transportation line stop",
								"description": "Transportation line stop.",
								"required": [],
								"properties": {
									"@type": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/@type",
										"type": "string",
										"title": "Identity type",
										"description": "Type of identity."
									},
									"idLocal": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/idLocal",
										"type": "string",
										"title": "Local identifier",
										"description": "Locally given identifier."
									},
									"systemTimeStamp": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/systemTimeStamp",
										"type": "string",
										"title": "System time stamp",
										"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
									},
									"referenceCustoms": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/referenceCustoms",
										"type": "string",
										"title": "Customs reference",
										"description": "Reference code for customs."
									},
									"descriptionGeneral": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/descriptionGeneral",
										"type": "string",
										"title": "Description",
										"description": "Description."
									},
									"categorizationLocal": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/categorizationLocal",
										"type": "string",
										"title": "Local category",
										"description": "Categorisation name given locally."
									},
									"countPersonnel": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPersonnel",
										"type": "integer",
										"title": "Personnel count",
										"description": "Personnel count (number of crew/personnel)."
									},
									"countPassenger": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPassenger",
										"type": "integer",
										"title": "Passenger count",
										"description": "Passenger count (amount of passengers)."
									},
									"countCargoDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countCargoDeclaration",
										"type": "integer",
										"title": "Cargo declaration count",
										"description": "Number of cargo declarations."
									},
									"countPersonnelList": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPersonnelList",
										"type": "integer",
										"title": "Personnel (crew) list count",
										"description": "Personnel (crew) list count (amount)."
									},
									"countPersonnelEffectDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPersonnelEffectDeclaration",
										"type": "integer",
										"title": "Personnel (crew) effect declaration count (amount)",
										"description": "Personnel (crew) effect declaration count (amount)."
									},
									"countShipStoreDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countShipStoreDeclaration",
										"type": "integer",
										"title": "Ship store declaration count",
										"description": "Ship store declaration count."
									},
									"countPassengerList": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPassengerList",
										"type": "integer",
										"title": "Passenger list count",
										"description": "Passenger list count (amount)."
									},
									"countHealthDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countHealthDeclaration",
										"type": "integer",
										"title": "Health declaration count (amount)",
										"description": "Health declaration count (amount)."
									},
									"vehicle": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle",
										"type": "object",
										"title": "",
										"description": "",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"categorizationCallSign": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/categorizationCallSign",
												"type": "string",
												"title": "Call sign type/category",
												"description": "Call sign type/category."
											},
											"nationality": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/nationality",
												"type": "string",
												"title": "Nationality",
												"description": "Nationality."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/categorizationLocal",
												"type": "integer",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/name",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"namePrefix": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/namePrefix",
												"type": "string",
												"title": "Name prefix",
												"description": "Name prefix."
											},
											"idCallSign": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/idCallSign",
												"type": "string",
												"title": "Call Sign",
												"description": "Maritime call signs are call signs assigned as unique identifiers to ships and boats. All radio transmissions must be individually identified by the call sign. Merchant and naval vessels are assigned call signs by their national licensing authorities."
											},
											"idImo": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/idImo",
												"type": "integer",
												"title": "IMO number",
												"description": "The IMO Ship Identification Number is a unique seven-digit number which remains unchanged through a vessel's lifetime and is linked to its hull, regardless of any changes of names, flags, or owners."
											},
											"idMmsi": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/idMmsi",
												"type": "integer",
												"title": "MMSI number",
												"description": "Maritime Mobile Service Identity (nine digit identifier) for vessels."
											},
											"certificate": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate",
												"type": "object",
												"title": "Certificate",
												"description": "Certificate.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"categorizationSecurity": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/categorizationSecurity",
														"type": "string",
														"title": "Security level",
														"description": "Security level."
													},
													"startDateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/startDateTime",
														"type": "string",
														"title": "Start time",
														"description": "Start time."
													},
													"endDateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/endDateTime",
														"type": "string",
														"title": "End time",
														"description": "End time."
													},
													"issuer": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/issuer",
														"type": "object",
														"title": "Issuer",
														"description": "Issuer.",
														"required": [],
														"properties": {
															"@type": {
																"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/issuer/properties/@type",
																"type": "string",
																"title": "Identity type",
																"description": "Type of identity."
															},
															"name": {
																"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/issuer/properties/name",
																"type": "string",
																"title": "Name",
																"description": "Name."
															}
														}
													}
												}
											}
										}
									},
									"station": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station",
										"type": "object",
										"title": "Station",
										"description": "Station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station/properties/name",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station/properties/idLocal",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"berth": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth",
										"type": "object",
										"title": "Berth",
										"description": "Berth.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth/properties/name",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth/properties/idLocal",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationCurrent": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationCurrent",
										"type": "object",
										"title": "Current station",
										"description": "Current station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationCurrent/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationCurrent/properties/idLocal",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationPrevious": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationPrevious",
										"type": "object",
										"title": "Previous station",
										"description": "Previous station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationPrevious/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationPrevious/properties/idLocal",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationNext": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationNext",
										"type": "object",
										"title": "Next station",
										"description": "Next station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationNext/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationNext/properties/idLocal",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationUnloading": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationUnloading",
										"type": "object",
										"title": "Loading station",
										"description": "Loading station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationUnloading/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationUnloading/properties/idLocal",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"agent": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent",
										"type": "object",
										"title": "Agent",
										"description": "Agent.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/name",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"role": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/role",
												"type": "string",
												"title": "Role",
												"description": "Property category related to role information."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/categorizationLocal",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"idEdi": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/idEdi",
												"type": "string",
												"title": "EDI number",
												"description": "Electronic Data Interchange code/number."
											}
										}
									},
									"arrival": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival",
										"type": "object",
										"title": "Arrival",
										"description": "The action or process (Event) of arriving.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"descriptionGeneral": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/descriptionGeneral",
												"type": "string",
												"title": "Description",
												"description": "Description."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/categorizationLocal",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"categorizationCargo": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/categorizationCargo",
												"type": "string",
												"title": "Cargo category",
												"description": "Category class/type of the cargo."
											},
											"draught": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/draught",
												"type": "string",
												"title": "Draught",
												"description": "The draft or draught of a ship's hull is the vertical distance between the waterline and the bottom of the hull (keel), with the thickness of the hull included."
											},
											"master": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/master",
												"type": "object",
												"title": "Master",
												"description": "Master.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/master/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/master/properties/name",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"operator": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/operator",
												"type": "object",
												"title": "Operator",
												"description": "Responsible for operating something (typically process or process task).",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/operator/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/operator/properties/name",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"forwarder": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/forwarder",
												"type": "object",
												"title": "Forwarder",
												"description": "Forwarder",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/forwarder/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/forwarder/properties/name",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"estimate": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate",
												"type": "object",
												"title": "Estimate",
												"description": "Estimate.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/datetime",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/systemTimeStamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/source",
														"type": "string",
														"title": "Source",
														"description": "Source of the information."
													}
												}
											},
											"actual": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual",
												"type": "object",
												"title": "Actual time",
												"description": "Actual time.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/datetime",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/systemTimeStamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/source",
														"type": "string",
														"title": "Source",
														"description": "Source of the information."
													}
												}
											}
										}
									},
									"departure": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure",
										"type": "object",
										"title": "",
										"description": "",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"descriptionGeneral": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/descriptionGeneral",
												"type": "string",
												"title": "Description",
												"description": "Description."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/categorizationLocal",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"draught": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/draught",
												"type": "string",
												"title": "Draught",
												"description": "The draft or draught of a ship's hull is the vertical distance between the waterline and the bottom of the hull (keel), with the thickness of the hull included."
											},
											"master": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/master",
												"type": "object",
												"title": "Master",
												"description": "Master.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/master/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/master/properties/name",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"operator": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/operator",
												"type": "object",
												"title": "Operator",
												"description": "Responsible for operating something (typically process or process task).",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/operator/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/operator/properties/name",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"forwarder": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/forwarder",
												"type": "object",
												"title": "Forwarder",
												"description": "Forwarder.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/forwarder/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/forwarder/properties/name",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"estimate": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate",
												"type": "object",
												"title": "Estimate",
												"description": "Estimate.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/datetime",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/systemTimeStamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/source",
														"type": "string",
														"title": "Source",
														"description": "Source of the information."
													}
												}
											},
											"actual": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual",
												"type": "object",
												"title": "Actual time",
												"description": "Actual time.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/@type",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/datetime",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/systemTimeStamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/source",
														"type": "string",
														"title": "Source",
														"description": "Source of the information."
													}
												}
											}
										}
									},
									"loading": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/loading",
										"type": "object",
										"title": "Loading",
										"description": "Loading process.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/loading/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/loading/properties/categorizationLocal",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											}
										}
									},
									"unloading": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/unloading",
										"type": "object",
										"title": "Unloading",
										"description": "Unloading (for example unloading shipment/delivery).",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/unloading/properties/@type",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/unloading/properties/categorizationLocal",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											}
										}
									}
								}
							},
							"signature": {
								"$id": "#/properties/data/properties/portCallReport/items/properties/signature",
								"type": "object",
								"title": "Signature",
								"description": "Signature.",
								"required": [],
								"properties": {
									"type": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/type",
										"type": "string",
										"title": "Type",
										"description": "Type."
									},
									"created": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/created",
										"type": "string",
										"title": "Created",
										"description": "Creation time."
									},
									"creator": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/creator",
										"type": "string",
										"title": "Creator",
										"description": "Party who has created the file or information."
									},
									"signatureValue": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/signatureValue",
										"type": "string",
										"title": "Signature value",
										"description": "Signature value."
									}
								}
							}
						}
					}
				}
			}
		}
	}
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
