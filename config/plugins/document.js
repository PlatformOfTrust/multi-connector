'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const winston = require('../../logger.js');
const FileType = require('file-type');
const mime = require('mime');

/**
 * Multi-purpose plugin for document connectors.
 */

const PLUGIN_NAME = 'document';

// Source mapping.
const documentSchema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/Document?v=3.0',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Document/?v=3.0',
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
                'document': {
                    '$id': '#/properties/data/properties/document',
                    'source': '',
                    'type': 'array',
                    'title': 'Document',
                    'description': 'An original or official paper (or other format) relied on as the basis, proof, or support of something.',
                    'items': {
                        '$id': '#/properties/data/properties/document/items',
                        'source': null,
                        'type': 'object',
                        'required': [],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/document/items/properties/@type',
                                'source': 'type',
                                'type': 'string',
                                'title': 'Identity type',
                                'description': 'Type of identity.',
                            },
                            'name': {
                                '$id': '#/properties/data/properties/document/items/properties/name',
                                'source': 'filename',
                                'type': 'string',
                                'title': 'Name',
                                'description': 'Name.',
                            },
                            'nameExtension': {
                                '$id': '#/properties/data/properties/document/items/properties/nameExtension',
                                'source': 'extension',
                                'type': 'string',
                                'title': 'File extension',
                                'description': 'File name extension.',
                            },
                            'url': {
                                '$id': '#/properties/data/properties/document/items/properties/url',
                                'source': null,
                                'type': 'string',
                                'title': 'URL address',
                                'description': 'URL address.',
                            },
                            'status': {
                                '$id': '#/properties/data/properties/document/items/properties/status',
                                'source': null,
                                'type': 'string',
                                'title': 'Life-cycle status',
                                'description': 'Life-cycle status.',
                            },
                            'content': {
                                '$id': '#/properties/data/properties/document/items/properties/content',
                                'source': 'content',
                                'type': 'string',
                                'title': 'Content',
                                'description': 'Content is "full description" of something.',
                            },
                            'categorizationInternetMediaType': {
                                '$id': '#/properties/data/properties/document/items/properties/categorizationInternetMediaType',
                                'source': 'mimetype',
                                'type': 'string',
                                'title': 'MIME type',
                                'description': 'A media type (also known as a Multipurpose Internet Mail Extensions or MIME type) is a standard that indicates the nature and format of a document, file, or assortment of bytes. It is defined and standardized in IETF\'s RFC 6838.',
                            },
                            'categorizationEncoding': {
                                '$id': '#/properties/data/properties/document/items/properties/categorizationEncoding',
                                'source': 'encoding',
                                'type': 'string',
                                'title': 'Encoding category (type)',
                                'description': 'Categorization based on encoding type (related to information technology).',
                            },
                            'sizeByte': {
                                '$id': '#/properties/data/properties/document/items/properties/sizeByte',
                                'source': 'filesize',
                                'type': 'integer',
                                'title': 'Byte size',
                                'description': 'Size of file in bytes.',
                            },
                            'party': {
                                '$id': '#/properties/data/properties/document/items/properties/party',
                                'source': null,
                                'type': 'array',
                                'title': 'Party',
                                'description': 'Party',
                                'items': {
                                    '$id': '#/properties/data/properties/document/items/properties/party/items',
                                    'source': null,
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/document/items/properties/party/items/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'name': {
                                            '$id': '#/properties/data/properties/document/items/properties/party/items/properties/name',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Name',
                                            'description': 'Name.',
                                        },
                                    },
                                },
                            },
                            'updated': {
                                '$id': '#/properties/data/properties/document/items/properties/updated',
                                'source': null,
                                'type': 'string',
                                'title': 'Update time',
                                'description': 'Last update time.',
                            },
                            'created': {
                                '$id': '#/properties/data/properties/document/items/properties/created',
                                'source': null,
                                'type': 'string',
                                'title': 'Created',
                                'description': 'Creation time.',
                            },
                            'idSource': {
                                '$id': '#/properties/data/properties/document/items/properties/idSource',
                                'source': null,
                                'type': 'string',
                                'title': 'Id source',
                                'description': 'Id in the source system.',
                            },
                            'digitalSignature': {
                                '$id': '#/properties/data/properties/document/items/properties/digitalSignature',
                                'source': null,
                                'type': 'array',
                                'title': 'Digital signature',
                                'description': 'Digital signature.',
                                'items': {
                                    '$id': '#/properties/data/properties/document/items/properties/digitalSignature/items',
                                    'source': null,
                                    'type': 'object',
                                    'required': [],
                                    'properties': {
                                        '@type': {
                                            '$id': '#/properties/data/properties/document/items/properties/digitalSignature/items/properties/@type',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Identity type',
                                            'description': 'Type of identity.',
                                        },
                                        'executor': {
                                            '$id': '#/properties/data/properties/document/items/properties/digitalSignature/items/properties/executor',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'Process executor',
                                            'description': 'Executor of the process (source of the data).',
                                        },
                                        'timestamp': {
                                            '$id': '#/properties/data/properties/document/items/properties/digitalSignature/items/properties/timestamp',
                                            'source': null,
                                            'type': 'string',
                                            'title': 'System time stamp',
                                            'description': 'System time stamp deriving typically from computer system.  Time when record (file) was created.',
                                        },
                                    },
                                },
                            },
                            'creator': {
                                '$id': '#/properties/data/properties/document/items/properties/creator',
                                'source': null,
                                'type': 'object',
                                'title': 'Creator',
                                'description': 'Party who has created the file or information.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/document/items/properties/creator/properties/@type',
                                        'source': null,
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/document/items/properties/creator/properties/name',
                                        'source': null,
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/document/items/properties/creator/properties/idLocal',
                                        'source': null,
                                        'type': 'string',
                                        'title': 'Local identifier',
                                        'description': 'Locally given identifier.',
                                    },
                                },
                            },
                            'updater': {
                                '$id': '#/properties/data/properties/document/items/properties/updater',
                                'source': null,
                                'type': 'object',
                                'title': 'Updater',
                                'description': 'Updater (updates file or information).  Same as modifier.',
                                'required': [],
                                'properties': {
                                    '@type': {
                                        '$id': '#/properties/data/properties/document/items/properties/updater/properties/@type',
                                        'source': null,
                                        'type': 'string',
                                        'title': 'Identity type',
                                        'description': 'Type of identity.',
                                    },
                                    'name': {
                                        '$id': '#/properties/data/properties/document/items/properties/updater/properties/name',
                                        'source': null,
                                        'type': 'string',
                                        'title': 'Name',
                                        'description': 'Name.',
                                    },
                                    'idLocal': {
                                        '$id': '#/properties/data/properties/document/items/properties/updater/properties/idLocal',
                                        'source': null,
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
        for (let j = 0; j < data.length; j++) {
            let result = {};
            const values = Array.isArray(data[j][config.output.value]) ? data[j][config.output.value] : [data[j][config.output.value]];
            for (let k = 0; k < values.length; k++) {
                const value = values[k];
                const key = Object.keys(documentSchema.properties.data.properties)[0];

                // Transform raw input.
                value.type = 'Document';
                result = transformer.transform(value, documentSchema.properties.data);

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
        }
        return object;
    } catch (err) {
        winston.log('error', err.message);
        return object;
    }
};

/**
 * Detect JSON data.
 *
 * @param {String} data
 * @return {Boolean}
 */
const isJSON = (data) => {
    try {
        return !!JSON.parse(data);
    } catch (e) {
        return false;
    }
};

/**
 * Converts CSV to JSON.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        if (typeof response.data === 'string' || response.data instanceof String) {
            const fileType = await FileType.fromBuffer(Buffer.from(response.data, 'base64'));
            const filenameParts = response.id.split('.');
            const ext = filenameParts[filenameParts.length - 1];
            response = {
                data: {
                    filename: response.id,
                    content: response.data,
                    extension: fileType ? fileType.ext : ext,
                    mimetype: fileType ? fileType.mime : mime.getType(ext),
                    encoding: 'base64',
                },
            };
            // Convert text content to plain data.
            if (!fileType) {
                response.data.content = Buffer.from(response.data.content, 'base64').toString('utf-8');
                response.data.encoding = 'utf-8';
                if (isJSON(response.data.content)) {
                    response.data.mimetype = 'application/json';
                    // response.data.content = JSON.parse(response.data.content);
                }
            }
        }
        return response;
    } catch (e) {
        console.log(e.message);
        return response;
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
        winston.log('error', err.message);
        return output;
    }
};

module.exports = {
    name: PLUGIN_NAME,
    output,
    response,
};
