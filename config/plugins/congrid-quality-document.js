'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const winston = require('../../logger.js');
const rp = require('request-promise');
const req = require('request');
const https = require('https');
const fs = require('fs');

/**
 * Congrid quality document creator plugin.
 */

const DOWNLOAD_DIR = './temp/';

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
                                'source': 'contentTypeName',
                                'type': 'string',
                                'title': 'File extension',
                                'description': 'File name extension.',
                            },
                            'url': {
                                '$id': '#/properties/data/properties/document/items/properties/url',
                                'source': 'downloadUrl',
                                'type': 'string',
                                'title': 'URL address',
                                'description': 'URL address.',
                            },
                            'status': {
                                '$id': '#/properties/data/properties/document/items/properties/status',
                                'source': 'statusId',
                                'type': 'string',
                                'title': 'Life-cycle status',
                                'description': 'Life-cycle status.',
                            },
                            'content': {
                                '$id': '#/properties/data/properties/document/items/properties/content',
                                'source': null,
                                'type': 'string',
                                'title': 'Content',
                                'description': 'Content is "full description" of something.',
                            },
                            'categorizationInternetMediaType': {
                                '$id': '#/properties/data/properties/document/items/properties/categorizationInternetMediaType',
                                'source': 'contentType',
                                'type': 'string',
                                'title': 'MIME type',
                                'description': 'A media type (also known as a Multipurpose Internet Mail Extensions or MIME type) is a standard that indicates the nature and format of a document, file, or assortment of bytes. It is defined and standardized in IETF\'s RFC 6838.',
                            },
                            'categorizationEncoding': {
                                '$id': '#/properties/data/properties/document/items/properties/categorizationEncoding',
                                'source': null,
                                'type': 'string',
                                'title': 'Encoding category (type)',
                                'description': 'Categorization based on encoding type (related to information technology).',
                            },
                            'sizeByte': {
                                '$id': '#/properties/data/properties/document/items/properties/sizeByte',
                                'source': null,
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
                                'source': 'modifiedAt',
                                'type': 'string',
                                'title': 'Update time',
                                'description': 'Last update time.',
                            },
                            'created': {
                                '$id': '#/properties/data/properties/document/items/properties/created',
                                'source': 'createdAt',
                                'type': 'string',
                                'title': 'Created',
                                'description': 'Creation time.',
                            },
                            'idSource': {
                                '$id': '#/properties/data/properties/document/items/properties/idSource',
                                'source': 'id',
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
                                'source': '',
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
                                        'source': 'createdBy',
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
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} [headers]
 * @param {String/Object/Array} [body]
 * @return {Promise}
 */
function request (method, url, headers, body) {
    const options = {
        method: method,
        uri: url,
        json: true,
        body: body,
        resolveWithFullResponse: true,
        headers: headers,
    };

    return rp(options).then(result => Promise.resolve(result))
        .catch((error) => {
            return Promise.reject(error);
        });
}

/**
 * Downloads file from given URL.
 *
 * @param {String} url
 * @param {String} folder
 * @return {Promise}
 */
const downloadFile = async (url, folder = 'unspecified') => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const dir = DOWNLOAD_DIR + folder;
        // Create directory, if it does not exist.
        if (!fs.existsSync(dir)) await fs.mkdirSync(dir);
        const downloadPath = dir  + '/' + filename;
        return new Promise(resolve => {
            const file = fs.createWriteStream(downloadPath);
            https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close();
                    resolve(downloadPath);
                });
            });
        });
    } catch (err) {
        winston.log('error', err.message);
        return null;
    }
};

/**
 * Uploads file to given URL.
 *
 * @param {Object} url
 * @param {String} filePath
 * @return {Promise}
 */
const uploadfile = async (url, filePath) => {
    try {
        return await new Promise((resolve, reject) => {
            const stats = fs.statSync(filePath);
            fs.createReadStream(filePath).pipe(req({
                method: 'PUT',
                url: url,
                headers: {
                    'Content-Length': stats['size'],
                },
            }, function (err, res) {
                // Remove uploaded file from local file system.
                fs.unlink(filePath, () => false);
                err ? reject(err) : resolve(res.statusCode);
            }));
        });
    } catch (err) {
        winston.log('error', err.message);
        return null;
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
 * Switch querying protocol to REST.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {

        // Validate type.
        if (template.parameters.targetObject['@type'] !== 'Document') {
            return template;
        }

        // TODO: Testing.
        const qualityDocumentName = 'Sertifikaatti';
        const projectCode = '123124';
        const workSectionCode = '2.1';
        const workActivityName = 'CE-dokumentit';

        // TODO: Get order from CALS by WP, which is in the end of the filename.
        // https://c4-prod-apim.azure-api.net/pot/instances/{instanceId}/purchaseorders/{purchaseOrderId}
        // Query CALS connector through broker API.

        const domain = 'https://api.congrid.com';
        const apiToken = 'cfe48adb6ae45905c2ffa823ece655f29a46a07d';
        const headers = {'Congrid-API-Token': apiToken};

        template.authConfig.url = domain;
        template.authConfig.headers['Congrid-API-Token'] = apiToken;

        const originalFilename = template.parameters.targetObject.name;
        const contentType = template.parameters.targetObject['categorizationInternetMediaType'];
        if (!contentType) {
            return Promise.reject(new Error('Missing field categorizationInternetMediaType.'));
        }

        /** Create document and fetch it */
        const projectsUrl = domain + '/v2/projects?projectCode=' + projectCode;
        const projects = await request('GET', projectsUrl, headers);
        const project = projects.body.results.find(p => p.projectCode === projectCode);

        const matricesUrl = domain + '/v2/projects/' + project.id + '/matrices';
        const matrices = await request('GET', matricesUrl, headers);
        const matrix = matrices.body.results.find(p => p.projectId === project.id);

        const workSectionsUrl = domain + '/v2/projects/' + project.id + '/workSections?matrixId=' + matrix.id + '&code=' + workSectionCode;
        const workSections = await request('GET', workSectionsUrl, headers);
        const workSection = workSections.body.results.find(p => p.code === workSectionCode);

        const workActivitiesUrl = domain + '/v2/projects/' + project.id + '/workActivities?matrixId=' + matrix.id + '&name=' + workActivityName;
        const workActivities = await request('GET', workActivitiesUrl, headers);
        const workActivity = workActivities.body.results.find(p => p.name === workActivityName);

        const body = {
            contentType,
            'createdAt': new Date().toISOString(),
            'name': qualityDocumentName,
            'statusId': 'PENDING',
            originalFilename,
            'projectId': project.id,
            'workActivityId': workActivity.id,
            'workSectionId': workSection.id,
        };

        const downloadUrl = template.parameters.targetObject['url'];
        if (!downloadUrl) {
            return Promise.reject(new Error('Missing field url.'));
        }

        // Download file from given url.
        const file = await downloadFile(downloadUrl, template.productCode);
        if (!file) {
            return Promise.reject(new Error('Failed to download file from given url.'));
        }

        // Create quality document.
        const qualityDocumentsUrl = domain + '/v2/qualityDocuments';
        const create = await request('POST', qualityDocumentsUrl, headers, body);
        const qualityDocument = create.body;

        // Upload quality document.
        const uploadUrl = qualityDocument.signedUploadUrl;
        const upload = await uploadfile(uploadUrl, file);
        if (!upload) {
            return Promise.reject(new Error('Failed to upload file to given url.'));
        }

        // Update quality document availability.
        body.available = true;
        await request('PUT', qualityDocumentsUrl + '/' + qualityDocument.id, headers, body);

        // Fetch the uploaded document.
        template.authConfig.path = '/v2/qualityDocuments/' + qualityDocument.id;
        template.dataObjects = [''];

    } catch (err) {
        winston.log('error', err.message);
        return template;
    }
    return template;
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
        // Validate type.
        if (config.output.array !== 'document') {
            return output;
        }

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

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'congrid-quality-document',
    template,
    output,
};
