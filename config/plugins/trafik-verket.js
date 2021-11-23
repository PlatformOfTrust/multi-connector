'use strict';
const transformer = require('../../app/lib/transformer');

const schema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards-ontotest.oftrust.net/v2/Schema/DataProductOutput/ParkingAndRestAreaInformation?v=2.0',
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'type': 'string',
            'const': 'https://standards-ontotest.oftrust.net/v2/Context/DataProductOutput/ParkingAndRestAreaInformation/?v=2.0',
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
                'zone': {
                    '$id': '#/properties/data/properties/zone',
                    'source': '',
                    'type': 'array',
                    'title': 'Zone',
                    'description': 'A zone is an area that can be defined by coordinates and polygons or collection of other space types like apartments or rooms.',
                    'items': {
                        '$id': '#/properties/data/properties/zone/items',
                        'source': null,
                        'type': 'object',
                        'required': [],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/zone/items/properties/@type',
                                'source': null,
                                'type': 'string',
                                'title': 'Identity type',
                                'description': 'Type of identity.',
                            },
                            'idLocal': {
                                '$id': '#/properties/data/properties/zone/items/properties/idLocal',
                                'source': 'Id',
                                'type': 'string',
                                'title': 'Local identifier',
                                'description': 'Locally given identifier.',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/zone/items/properties/name',
                                'source': 'Name',
                                'type': 'string',
                                'title': 'Name',
                                'description': 'Name.',
                            },
                            'location': {
                                '$id': '#/properties/data/properties/zone/items/properties/location',
                                'source': 'coordinates',
                                'type': 'array',
                                'title': 'Location',
                                'description': 'Property category for location related information.',
                                'items': {
                                    '$id': '#/properties/data/properties/zone/items/properties/location/items',
                                    'source': null,
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/zone/items/properties/location/items/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'longitude': {
                                            '$id': '#/properties/data/properties/zone/items/properties/location/items/properties/longitude',
                                            'source': 'longitude',
                                            'type': 'string',
                                            'title': 'Longitude',
                                            'description': 'Angular distance east or west on the earth\'s surface, measured by the angle contained between the meridian of a particular place and some prime meridian, as that of Greenwich, England, and expressed either in degrees or by some corresponding difference in time (WGS 84).',
                                        },
                                        'latitude': {
                                            '$id': '#/properties/data/properties/zone/items/properties/location/items/properties/latitude',
                                            'source': 'latitude',
                                            'type': 'string',
                                            'title': 'Latitude',
                                            'description': 'The angular distance north or south from the equator of a point on the earth\'s surface, measured on the meridian of the point (WGS 84).',
                                        },
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
                    'description': 'Type.',
                },
                'created': {
                    '$id': '#/properties/signature/properties/created',
                    'source': null,
                    'type': 'string',
                    'title': 'Created',
                    'description': 'Creation time.',
                },
                'creator': {
                    '$id': '#/properties/signature/properties/creator',
                    'source': null,
                    'type': 'string',
                    'title': 'Creator',
                    'description': 'Party who has created the file or information.',
                },
                'signatureValue': {
                    '$id': '#/properties/signature/properties/signatureValue',
                    'source': null,
                    'type': 'string',
                    'title': 'Signature value',
                    'description': 'Signature value.',
                },
            },
        },
    },
    'version': '2.0',
};
const template = async (config, template) => {
    return template;
	
};
const response = async (config, res) => {
    return res;
	
};
const output = async (config, output) => {
    
    const parkingData = output.data.ParkingData[0].data[0].value.RESPONSE.RESULT[0].Parking;
    const result = [];
    for (let i = 0; i < parkingData.length; i++) {
        result.push(handleData(config, 0, parkingData[i]));
    }
    return result;
};

const handleData = function (config, id, data) {
    const pointArray = data.Geometry.WGS84.toString().replace(/[()]/g, '').split(' ');
    const coordinates = {
        'longitude': pointArray[1],
        'latitude': pointArray[2],
    };
    const value = data;
    value.coordinates = {...coordinates};    
    const result = transformer.transform(value, schema.properties.data);
    return result;
};

module.exports = {
    name: 'trafik-verket',
    template,
    response,
    output,

};