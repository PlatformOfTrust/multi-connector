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
	"source": null,
	"type": "object",
	"required": [],
	"properties": {
		"@context": {
			"$id": "#/properties/@context",
			"source": null,
			"type": "string",
			"const": "https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/VehicleInformation/PortCallReport/?v=2.0",
			"title": "JSON-LD context url",
			"description": "JSON-LD context url with terms required to understand data product content."
		},
		"data": {
			"$id": "#/properties/data",
			"source": null,
			"type": "object",
			"title": "",
			"description": "",
			"required": [],
			"properties": {
				"portCallReport": {
					"$id": "#/properties/data/properties/portCallReport",
					"source": '',
					"type": "array",
					"title": "Port Call Report",
					"description": "Port Call Report.",
					"items": {
						"$id": "#/properties/data/properties/portCallReport/items",
						"source": null,
						"type": "object",
						"required": [],
						"properties": {
							"transportationTripStop": {
								"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop",
								"source": null,
								"type": "object",
								"title": "Transportation line stop",
								"description": "Transportation line stop.",
								"required": [],
								"properties": {
									"@type": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/@type",
										"source": "type",
										"type": "string",
										"title": "Identity type",
										"description": "Type of identity."
									},
									"idLocal": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/idLocal",
										"source": "portCallId",
										"type": "string",
										"title": "Local identifier",
										"description": "Locally given identifier."
									},
									"systemTimeStamp": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/systemTimeStamp",
										"source": "portCallTimestamp",
										"type": "string",
										"title": "System time stamp",
										"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
									},
									"referenceCustoms": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/referenceCustoms",
										"source": "customsReference",
										"type": "string",
										"title": "Customs reference",
										"description": "Reference code for customs."
									},
									"descriptionGeneral": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/descriptionGeneral",
										"source": "imoInformation.briefParticularsVoyage",
										"type": "string",
										"title": "Description",
										"description": "Description."
									},
									"categorizationLocal": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/categorizationLocal",
										"source": "imoInformation.imoGeneralDeclaration",
										"type": "string",
										"title": "Local category",
										"description": "Categorisation name given locally."
									},
									"countPersonnel": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPersonnel",
										"source": "imoInformation.numberOfCrew",
										"type": "integer",
										"title": "Personnel count",
										"description": "Personnel count (number of crew/personnel)."
									},
									"countPassenger": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPassenger",
										"source": "imoInformation.numberOfPassangers",
										"type": "integer",
										"title": "Passenger count",
										"description": "Passenger count (amount of passengers)."
									},
									"countCargoDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countCargoDeclaration",
										"source": "imoInformation.cargoDeclarationOb",
										"type": "integer",
										"title": "Cargo declaration count",
										"description": "Number of cargo declarations."
									},
									"countPersonnelList": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPersonnelList",
										"source": "imoInformation.crewListsOb",
										"type": "integer",
										"title": "Personnel (crew) list count",
										"description": "Personnel (crew) list count (amount)."
									},
									"countPersonnelEffectDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPersonnelEffectDeclaration",
										"source": "imoInformation.crewsEffectsDeclarationsOb",
										"type": "integer",
										"title": "Personnel (crew) effect declaration count (amount)",
										"description": "Personnel (crew) effect declaration count (amount)."
									},
									"countShipStoreDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countShipStoreDeclaration",
										"source": "imoInformation.shipStoresDeclarationsOb",
										"type": "integer",
										"title": "Ship store declaration count",
										"description": "Ship store declaration count."
									},
									"countPassengerList": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countPassengerList",
										"source": "imoInformation.passangerListsOb",
										"type": "integer",
										"title": "Passenger list count",
										"description": "Passenger list count (amount)."
									},
									"countHealthDeclaration": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/countHealthDeclaration",
										"source": "imoInformation.healthDeclarationsOb",
										"type": "integer",
										"title": "Health declaration count (amount)",
										"description": "Health declaration count (amount)."
									},
									"vehicle": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle",
										"source": null,
										"type": "object",
										"title": "",
										"description": "",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/@type",
												"source": "vehicleType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"categorizationCallSign": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/categorizationCallSign",
												"source": "radioCallSignType",
												"type": "string",
												"title": "Call sign type/category",
												"description": "Call sign type/category."
											},
											"nationality": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/nationality",
												"source": "nationality",
												"type": "string",
												"title": "Nationality",
												"description": "Nationality."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/categorizationLocal",
												"source": "vesselTypeCode",
												"type": "integer",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/name",
												"source": "vesselName",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"namePrefix": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/namePrefix",
												"source": "vesselNamePrefix",
												"type": "string",
												"title": "Name prefix",
												"description": "Name prefix."
											},
											"idCallSign": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/idCallSign",
												"source": "radioCallSign",
												"type": "string",
												"title": "Call Sign",
												"description": "Maritime call signs are call signs assigned as unique identifiers to ships and boats. All radio transmissions must be individually identified by the call sign. Merchant and naval vessels are assigned call signs by their national licensing authorities."
											},
											"idImo": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/idImo",
												"source": "imoLloyds",
												"type": "integer",
												"title": "IMO number",
												"description": "The IMO Ship Identification Number is a unique seven-digit number which remains unchanged through a vessel's lifetime and is linked to its hull, regardless of any changes of names, flags, or owners."
											},
											"idMmsi": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/idMmsi",
												"source": "mmsi",
												"type": "integer",
												"title": "MMSI number",
												"description": "Maritime Mobile Service Identity (nine digit identifier) for vessels."
											},
											"certificate": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate",
												"source": null,
												"type": "object",
												"title": "Certificate",
												"description": "Certificate.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/@type",
														"source": "vehicleCertificateType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"categorizationSecurity": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/categorizationSecurity",
														"source": "currentSecurityLevel",
														"type": "string",
														"title": "Security level",
														"description": "Security level."
													},
													"startDateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/startDateTime",
														"source": "certificateStartDate",
														"type": "string",
														"title": "Start time",
														"description": "Start time."
													},
													"endDateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/endDateTime",
														"source": "certificateEndDate",
														"type": "string",
														"title": "End time",
														"description": "End time."
													},
													"issuer": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/issuer",
														"source": null,
														"type": "object",
														"title": "Issuer",
														"description": "Issuer.",
														"required": [],
														"properties": {
															"@type": {
																"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/issuer/properties/@type",
																"source": "vehicleCertificateIssuerType",
																"type": "string",
																"title": "Identity type",
																"description": "Type of identity."
															},
															"name": {
																"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/vehicle/properties/certificate/properties/issuer/properties/name",
																"source": "certificateIssuer",
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
										"source": null,
										"type": "object",
										"title": "Station",
										"description": "Station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station/properties/@type",
												"source": "stationType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station/properties/name",
												"source": "portAreaDetails.portAreaName",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/station/properties/idLocal",
												"source": "portAreaDetails.portAreaCode",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"berth": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth",
										"source": null,
										"type": "object",
										"title": "Berth",
										"description": "Berth.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth/properties/@type",
												"source": "berthType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth/properties/name",
												"source": "portAreaDetails.berthName",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/berth/properties/idLocal",
												"source": "portAreaDetails.berthCode",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationCurrent": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationCurrent",
										"source": null,
										"type": "object",
										"title": "Current station",
										"description": "Current station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationCurrent/properties/@type",
												"source": "stationCurrentType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationCurrent/properties/idLocal",
												"source": "portToVisit",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationPrevious": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationPrevious",
										"source": null,
										"type": "object",
										"title": "Previous station",
										"description": "Previous station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationPrevious/properties/@type",
												"source": "stationPreviousType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationPrevious/properties/idLocal",
												"source": "prevPort",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationNext": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationNext",
										"source": null,
										"type": "object",
										"title": "Next station",
										"description": "Next station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationNext/properties/@type",
												"source": "stationNextType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationNext/properties/idLocal",
												"source": "nextPort",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"stationUnloading": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationUnloading",
										"source": null,
										"type": "object",
										"title": "Loading station",
										"description": "Loading station.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationUnloading/properties/@type",
												"source": "stationUnloadingType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"idLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/stationUnloading/properties/idLocal",
												"source": "imoInformation.portOfDischarge",
												"type": "string",
												"title": "Local identifier",
												"description": "Locally given identifier."
											}
										}
									},
									"agent": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent",
										"source": null,
										"type": "object",
										"title": "Agent",
										"description": "Agent.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/@type",
												"source": "agentType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"name": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/name",
												"source": "agentInfo.name",
												"type": "string",
												"title": "Name",
												"description": "Name."
											},
											"role": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/role",
												"source": "agentInfo.role",
												"type": "string",
												"title": "Role",
												"description": "Property category related to role information."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/categorizationLocal",
												"source": "agentInfo.portCallDirection",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"idEdi": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/agent/properties/idEdi",
												"source": "agentInfo.ediNumber",
												"type": "string",
												"title": "EDI number",
												"description": "Electronic Data Interchange code/number."
											}
										}
									},
									"arrival": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival",
										"source": null,
										"type": "object",
										"title": "Arrival",
										"description": "The action or process (Event) of arriving.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/@type",
												"source": "arrivalType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"descriptionGeneral": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/descriptionGeneral",
												"source": "freeTextArrival",
												"type": "string",
												"title": "Description",
												"description": "Description."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/categorizationLocal",
												"source": "domesticTrafficArrival",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"categorizationCargo": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/categorizationCargo",
												"source": "arrivalWithCargo",
												"type": "string",
												"title": "Cargo category",
												"description": "Category class/type of the cargo."
											},
											"draught": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/draught",
												"source": "arrivalDraught",
												"type": "string",
												"title": "Draught",
												"description": "The draft or draught of a ship's hull is the vertical distance between the waterline and the bottom of the hull (keel), with the thickness of the hull included."
											},
											"master": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/master",
												"source": null,
												"type": "object",
												"title": "Master",
												"description": "Master.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/master/properties/@type",
														"source": "arrivalMasterType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/master/properties/name",
														"source": "shipMasterArrival",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"operator": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/operator",
												"source": null,
												"type": "object",
												"title": "Operator",
												"description": "Responsible for operating something (typically process or process task).",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/operator/properties/@type",
														"source": "arrivalOperatorType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/operator/properties/name",
														"source": "managementNameArrival",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"forwarder": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/forwarder",
												"source": null,
												"type": "object",
												"title": "Forwarder",
												"description": "Forwarder",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/forwarder/properties/@type",
														"source": "arrivalForwarderType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/forwarder/properties/name",
														"source": "forwarderNameArrival",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"estimate": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate",
												"source": null,
												"type": "object",
												"title": "Estimate",
												"description": "Estimate.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/@type",
														"source": "arrivalEstimateType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/datetime",
														"source": "portAreaDetails.eta",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/systemTimeStamp",
														"source": "portAreaDetails.etaTimestamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/estimate/properties/source",
														"source": "portAreaDetails.etaSource",
														"type": "string",
														"title": "Source",
														"description": "Source of the information."
													}
												}
											},
											"actual": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual",
												"source": null,
												"type": "object",
												"title": "Actual time",
												"description": "Actual time.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/@type",
														"source": "arrivalActualType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/datetime",
														"source": "ata",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/systemTimeStamp",
														"source": "ataTimestamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/arrival/properties/actual/properties/source",
														"source": "ataSource",
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
										"source": null,
										"type": "object",
										"title": "",
										"description": "",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/@type",
												"source": "departureType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"descriptionGeneral": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/descriptionGeneral",
												"source": "freeTextDeparture",
												"type": "string",
												"title": "Description",
												"description": "Description."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/categorizationLocal",
												"source": "domesticTrafficDeparture",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											},
											"draught": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/draught",
												"source": "portAreaDetails.departureDraught",
												"type": "string",
												"title": "Draught",
												"description": "The draft or draught of a ship's hull is the vertical distance between the waterline and the bottom of the hull (keel), with the thickness of the hull included."
											},
											"master": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/master",
												"source": null,
												"type": "object",
												"title": "Master",
												"description": "Master.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/master/properties/@type",
														"source": "departureMasterType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/master/properties/name",
														"source": "shipMasterDeparture",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"operator": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/operator",
												"source": null,
												"type": "object",
												"title": "Operator",
												"description": "Responsible for operating something (typically process or process task).",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/operator/properties/@type",
														"source": "departureOperatorType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/operator/properties/name",
														"source": "managementNameDeparture",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"forwarder": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/forwarder",
												"source": null,
												"type": "object",
												"title": "Forwarder",
												"description": "Forwarder.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/forwarder/properties/@type",
														"source": "departureForwarderType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"name": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/forwarder/properties/name",
														"source": "forwarderNameDeparture",
														"type": "string",
														"title": "Name",
														"description": "Name."
													}
												}
											},
											"estimate": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate",
												"source": null,
												"type": "object",
												"title": "Estimate",
												"description": "Estimate.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/@type",
														"source": "departureEstimateType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/datetime",
														"source": "portAreaDetails.etd",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/systemTimeStamp",
														"source": "portAreaDetails.etdTimestamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/estimate/properties/source",
														"source": "portAreaDetails.etdSource",
														"type": "string",
														"title": "Source",
														"description": "Source of the information."
													}
												}
											},
											"actual": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual",
												"source": null,
												"type": "object",
												"title": "Actual time",
												"description": "Actual time.",
												"required": [],
												"properties": {
													"@type": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/@type",
														"source": "departureActualType",
														"type": "string",
														"title": "Identity type",
														"description": "Type of identity."
													},
													"dateTime": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/datetime",
														"source": "portAreaDetails.atd",
														"type": "string",
														"title": "Date time",
														"description": "Date time."
													},
													"systemTimeStamp": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/systemTimeStamp",
														"source": "portAreaDetails.atdTimestamp",
														"type": "string",
														"title": "System time stamp",
														"description": "System time stamp deriving typically from computer system.  Time when record (file) was created."
													},
													"source": {
														"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/departure/properties/actual/properties/source",
														"source": "portAreaDetails.atdSource",
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
										"source": null,
										"type": "object",
										"title": "Loading",
										"description": "Loading process.",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/loading/properties/@type",
												"source": "loadingType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/loading/properties/categorizationLocal",
												"source": "notLoading",
												"type": "string",
												"title": "Local category",
												"description": "Categorisation name given locally."
											}
										}
									},
									"unloading": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/unloading",
										"source": null,
										"type": "object",
										"title": "Unloading",
										"description": "Unloading (for example unloading shipment/delivery).",
										"required": [],
										"properties": {
											"@type": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/unloading/properties/@type",
												"source": "unloadingType",
												"type": "string",
												"title": "Identity type",
												"description": "Type of identity."
											},
											"categorizationLocal": {
												"$id": "#/properties/data/properties/portCallReport/items/properties/transportationTripStop/properties/unloading/properties/categorizationLocal",
												"source": "discharge",
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
								"source": null,
								"type": "object",
								"title": "Signature",
								"description": "Signature.",
								"required": [],
								"properties": {
									"type": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/type",
										"source": null,
										"type": "string",
										"title": "Type",
										"description": "Type."
									},
									"created": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/created",
										"source": null,
										"type": "string",
										"title": "Created",
										"description": "Creation time."
									},
									"creator": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/creator",
										"source": null,
										"type": "string",
										"title": "Creator",
										"description": "Party who has created the file or information."
									},
									"signatureValue": {
										"$id": "#/properties/data/properties/portCallReport/items/properties/signature/properties/signatureValue",
										"source": null,
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
            value.type = 'TransportationTripStop';
			value.vehicleType = 'Vessel';
			value.vehicleCertificateType = 'Certificate';
			value.vehicleCertificateIssuerType = 'Organization';
			value.stationType = 'TransportationStation';
			value.berthType = 'Berth';
			value.stationCurrentType = 'TransportationStation';
			value.stationPreviousType = 'TransportationStation';
			value.stationNextType = 'TransportationStation';
			value.stationUnloadingType = 'TransportationStation';
			value.agentType = 'Organization';
			value.arrivalType = 'Arrival';
			value.arrivalMasterType = 'Person';
			value.arrivalOperatorType = 'Organization';
			value.arrivalForwarderType = 'Organization';
			value.arrivalEstimateType = 'Time';
			value.arrivalActualType = 'Time';
			value.departureType = 'Departure';
			value.departureMasterType = 'Person';
			value.departureOperatorType = 'Organization';
			value.departureForwarderType = 'Organization';
			value.departureEstimateType = 'Time';
			value.departureActualType = 'Time';
			value.loadingType = 'Loading';
			value.unloadingType = 'Unloading';

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
    name: 'digitraffic-port-call',
    output,
    onerror
};
