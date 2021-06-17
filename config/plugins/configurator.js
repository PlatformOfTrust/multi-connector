'use strict';
/**
 * Module dependencies.
 */
const transformer = require('../../app/lib/transformer');
const connector = require('../../app/lib/connector');
const winston = require('../../logger.js');
const cache = require('../../app/cache');
const rsa = require('../../app/lib/rsa');
const rp = require('request-promise');
const _ = require('lodash');

/**
 * Configurator plugin for creating and updating configs.
 */

const PLUGIN_NAME = 'configurator';
const EXPIRATION_TIME = 86400000;
const CHECK_INTERVAL = 5 * 60 * 1000;
let lastUpdate = null;
let connectorURL = '';

/*
{
    "@context": "https://standards.oftrust.net/v2/Context/Identity/Product/DataProduct/",
    "@type": "DataProduct",
    "@id": "https://api-sandbox.oftrust.net/products/v1/B6AA3FB2-3CD8-4DDE-833E-C740A33E63D2",
    "productCode": "B6AA3FB2-3CD8-4DDE-833E-C740A33E63D2",
    "dataContext": "https://standards.oftrust.net/v2/Context/DataProductOutput/",
    "parameterContext": "https://standards.oftrust.net/v2/Context/DataProductParameters/",
    "translatorUrl": "https://connector.oftrust.dev/translator/v1/fetch",
    "name": "Connector",
    "organizationPublicKeys": [
        {
            "type": "RsaSignature2018",
            "url": "https://connector.oftrust.dev/translator/v1/public.key"
        }
    ],
    "description": "Connector to receive purchase order",
    "imageUrl": "https://www.pinclipart.com/picdir/big/489-4899691_connection-icon-free-clipart.png",
    "identityId": "33fd1e30-7141-4ce5-aabe-5925cefc55f5",
    "authorizationLayer": "None"
}
*/

// Source mapping.
const dataProductSchema = {
    '$schema': 'http://json-schema.org/draft-06/schema#',
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/DataProduct/',
    'source': null,
    'type': 'object',
    'required': [],
    'properties': {
        '@context': {
            '$id': '#/properties/@context',
            'source': null,
            'type': 'string',
            'const': 'https://standards.oftrust.net/v2/Context/DataProductOutput/DataProduct/',
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
                'dataProduct': {
                    '$id': '#/properties/data/properties/dataProduct',
                    'source': '',
                    'type': 'array',
                    'title': 'Document',
                    'description': 'An original or official paper (or other format) relied on as the basis, proof, or support of something.',
                    'items': {
                        '$id': '#/properties/data/properties/dataProduct/items',
                        'source': null,
                        'type': 'object',
                        'required': [],
                        'properties': {
                            '@type': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/@type',
                                'source': 'type',
                                'type': 'string',
                                'title': 'Identity type',
                                'description': 'Type of identity.',
                            },
                            '@context': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/@context',
                                'source': 'context',
                                'type': 'string',
                                'title': 'Context',
                                'description': 'Context.',
                            },
                            '@id': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/@id',
                                'source': 'id',
                                'type': 'string',
                                'title': 'Name',
                                'description': 'Name.',
                            },
                            'productCode': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/productCode',
                                'source': 'productCode',
                                'type': 'string',
                                'title': 'Product code',
                                'description': 'Product code.',
                            },
                            'dataContext': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/dataContext',
                                'source': 'dataContext',
                                'type': 'string',
                                'title': 'Data Context',
                                'description': 'Data Context.',
                            },
                            'parameterContext': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/parameterContext',
                                'source': 'parameterContext',
                                'type': 'string',
                                'title': 'Parameter Context',
                                'description': 'Parameter Context.',
                            },
                            'translatorUrl': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/translatorUrl',
                                'source': 'translatorUrl',
                                'type': 'string',
                                'title': 'Translator URL',
                                'description': 'Translator URL.',
                            },
                            'organizationPublicKeys': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/organizationPublicKeys',
                                'source': 'organizationPublicKeys',
                                'type': 'string',
                                'title': 'Organization Public Keys',
                                'description': 'Organization Public Keys.',
                            },
                            'description': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/description',
                                'source': 'description',
                                'type': 'string',
                                'title': 'Description',
                                'description': 'Description.',
                            },
                            'imageUrl': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/imageUrl',
                                'source': 'imageUrl',
                                'type': 'string',
                                'title': 'Image URL',
                                'description': 'Image URL.',
                            },
                            'identityId': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/identityId',
                                'source': 'identityId',
                                'type': 'string',
                                'title': 'Identity ID',
                                'description': 'Identity ID.',
                            },
                            'authorizationLayer': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/authorizationLayer',
                                'source': 'authorizationLayer',
                                'type': 'string',
                                'title': 'Authorization Layer',
                                'description': 'Authorization Layer.',
                            },
                            'config': {
                                '$id': '#/properties/data/properties/dataProduct/items/properties/config',
                                'source': 'config',
                                'type': 'string',
                                'title': 'Authorization Layer',
                                'description': 'Authorization Layer.',
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
                const key = Object.keys(dataProductSchema.properties.data.properties)[0];

                value.config = {
                    template: value.template,
                    static: null,
                    dynamic: null,
                    plugins: value.plugins,
                };

                // Transform raw input.
                value.type = 'DataProduct';
                value.context = 'https://standards.oftrust.net/v2/Context/Identity/Product/DataProduct/';
                value.id = 'https://api.oftrust.net/products/v1/' + encodeURI(value.productCode);
                value.dataContext = 'https://standards.oftrust.net/v2/Context/DataProductOutput/';
                value.parameterContext = 'https://standards.oftrust.net/v2/Context/DataProductParameters/';
                value.translatorUrl = config.authConfig.connectorURL + '/translator/v1/fetch';
                value.organizationPublicKeys = [
                    {
                        'type': 'RsaSignature2018',
                        'url': config.authConfig.connectorURL + '/translator/v1/public.key',
                    },
                ];
                value.authorizationLayer = 'None';
                result = transformer.transform(value, dataProductSchema.properties.data);

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
 * Adds custom public key URLs to cache.
 *
 * @param {Array/String} URLs
 * @param {Number} count
 */
const fetchPublicKeys = async (URLs, count = 0) => {
    URLs = Array.isArray(URLs) ? URLs : [URLs];
    for (let j = 0; j < URLs.length; j++) {
        const body = await rp({method: 'GET', url: URLs[j]});
        if (body) {
            const priority = count + j;
            cache.setDoc('publicKeys', priority.toString(), {
                priority,
                url: URLs[j],
                env: process.env.NODE_ENV || 'development',
                key: body.toString(),
            });
        }
    }
};

const sign = (response = [], url = connectorURL, client = undefined) => {
    response = Array.isArray(response) ? response : [response];

    // Initialize signature object.
    const signature = {
        type: 'RsaSignature2018',
        created: new Date().toISOString(),
        creator: url + '/translator/v1/public.key',
    };

    // Compose signed data response.
    return {
        ...{message: [...response] || []},
        signature: {
            ...signature,
            client,
            signatureValue: rsa.generateSignature({
                __signed__: signature.created,
                ...(response || []),
            }),
        },
    };
};

const requestConfigs = async (configs = []) => {
    let current;
    for (let i = 0; i < configs.length; i++) {
        try {
            const productCode = configs[i][0];
            const config = configs[i][1];
            current = config.static.url;
            const path = config.static.path;
            const body = sign({
                productCode,
                timestamp: new Date().toISOString(),
                parameters: {
                    path,
                },
            }, null, config.static.clientId);
            const url = config.static.url + config.static.callbackPath;
            const result = await rp({method: 'POST', url, body, json: true});
            winston.log('info', 'Received configs from ' + current + ': ' + result.message.map(o => o.productCode));
        } catch (err) {
            winston.log('error', 'Failed to request configs from ' + current + ': ' + err.message);
        }
    }
};

// Set listener for completion of loading.
connector.emitter.on('collections',
    async (collections) => {
        try {
            // Sleep for 5s to allow system URLs to be fetch first.
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Find all configs, which utilize the configurator.
            const configuratorConfigs = Object.entries(collections['configs']).filter(c => (c[1].template.plugins || []).includes('configurator'));
            let count = cache.getDocs('publicKeys').length;
            for (let i = 0; i < configuratorConfigs.length; i++) {
                const URLs = configuratorConfigs[i][1].static.publicKeyURLs || [];
                await fetchPublicKeys(URLs, count);
                count += URLs.length;
                // 2. Request configs from master.
                await requestConfigs([configuratorConfigs[i]]);
            }
            setInterval(() => {
                if (lastUpdate < (new Date().getTime() - EXPIRATION_TIME)) requestConfigs(configuratorConfigs);
            }, CHECK_INTERVAL);
        } catch (err) {
            winston.log('error', err.message);
        }
    });

/**
 * Retrieves configs from cache.
 *
 * @param {Object} config
 * @param {Object/String} res
 * @return {Object}
 */
const response = async (config, res) => {
    let response;
    /** Data fetching. */
    try {
        if (config.parameters.type !== 'update') {
            const ids = (_.get(config, 'parameters.ids') || []).map(object => object.id);
            const keys = cache.getKeys('configs');
            response = keys.sort((a, b) => {
                return ('' + a).localeCompare(b);
            }).filter(c => ids.includes(c) || ids.length === 0)
                .map(productCode => {
                    const config = cache.getDoc('configs', productCode);
                    const template = cache.getDoc('templates', config.template) || {plugins: []};
                    const pluginConfig = template.plugins.reduce((acc, curr) => (acc[curr] = null, acc), {});
                    return {
                        productCode,
                        template: config.template,
                        static: null,
                        dynamic: null,
                        plugins: pluginConfig,
                    };
                });
        } else {
            response = res;
        }
        response = sign(response, config.authConfig.connectorURL);

        // Store connector URL for later use.
        connectorURL = config.authConfig.connectorURL;
    } catch (err) {
        winston.log('error', err.message);
    }
    return response;
};

const updateConfigs = async (dataProducts) => {
    const items = Array.isArray(dataProducts) ? dataProducts : [dataProducts];
    const errors = [];
    const result = [];
    for (let i = 0; i < items.length; i++) {
        const config = items[i].config;
        const productCode = items[i].productCode || items[i].id;
        if (config !== null) {
            try {
                /** 1. Create or update. */
                if (!_.isObject(config)) continue;
                if (_.isEmpty(config)) continue;

                const template = config.template;
                const systemTemplates = cache.getKeys('templates');

                // Validate template.
                if (!systemTemplates.includes(template)) {
                    template !== undefined
                        ? errors.push(productCode + ' - Missing required template: ' + template)
                        : errors.push(productCode + ' - Missing required field: template');
                } else {
                    winston.log('info', 'Update ' + productCode);
                    cache.setDoc('configs', productCode, {
                        template,
                        ...config,
                    });
                    result.push({
                        productCode,
                        name: items[i].name,
                        template,
                    });
                    lastUpdate = new Date().getTime();
                }
            } catch (err) {
                errors.push(productCode + ' - ' + err.message);
            }
        } else {
            /** 2. Remove. */
            winston.log('info', 'Remove ' + productCode);
            cache.delDoc('configs', productCode);
        }
    }

    return {
        result,
        err: errors,
    };
};

/**
 * Switch querying protocol.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        let objects = template.parameters.targetObject || [];
        objects = Array.isArray(objects) ? objects : [objects];
        const queryObjects = objects.filter(t => Object.hasOwnProperty.call(t, 'productCode'));
        const dataObjects = objects.filter(t => Object.hasOwnProperty.call(t, 'id'));

        if (queryObjects.length > 0 && dataObjects.length === 0) {
            /** 1. Query. */
            template.parameters.type = 'query';
            template.parameters.ids = queryObjects.map(i => i.productCode).flat().map(p => { return {id: p};});
            template.authConfig.path = queryObjects[0].productCode;
            if (template.authConfig.path.length === 0) {
                template.authConfig.path = [''];
            }
        } else {
            /** 2. Update. */
            template.parameters.type = 'update';
            const {result, err} = await updateConfigs(template.parameters.targetObject);
            if (err.length > 0) return Promise.reject(new Error(err.toString()));
            template.authConfig.path = result;
        }
        return template;
    } catch (err) {
        return Promise.reject(err);
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

/**
 * Expose plugin methods.
 */
module.exports = {
    name: PLUGIN_NAME,
    template,
    response,
    output,
};
