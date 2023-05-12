'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rp = require('request-promise');
const _ = require('lodash');

/**
 * DSaaS plugin.
 */

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} headers
 * @param {String/Object/Array} body
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
 * Switch querying to Data Storage.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        if (template.mode === 'history') {
            // Validate DSaaS credentials.
            if (!_.get(config, 'plugins.dsaas.url') || !_.get(config, 'plugins.dsaas.functionCode')) {
                winston.log('info', 'Missing required plugin credentials for DSaaS history query.');
            }

            // Make sure targetObject is an array.
            template.parameters.targetObject = Array.isArray(template.parameters.targetObject) ? template.parameters.targetObject : [template.parameters.targetObject];
            // Make sure idLocal fields are arrays.
            template.parameters.targetObject = template.parameters.targetObject.map(targetObject => ({
                idLocal: Array.isArray(targetObject.idLocal) ? targetObject.idLocal : [targetObject.idLocal],
            }));

            const operation = 'read';
            template.protocol = 'rest';
            template.parameters.dataTypes = ['MeasurePresence'];
            template.authConfig = {
                url:  _.get(config, 'plugins.dsaas.url'),
                path: `/api/${operation}`,
                method: 'POST',
                body: {
                    productCode: config.productCode,
                    '@context': 'https://standards.oftrust.net/v2/Context/DataProductOutput/Sensor/?v=4.0',
                    parameters: template.parameters,
                },
            };
            template.generalConfig = {
                query: {
                    properties: [
                        {
                            code: _.get(config, 'plugins.dsaas.functionCode'),
                        },
                    ],
                },
                hardwareId: {
                    dataObjectProperty: 'id',
                },
                timestamp: {
                    'dataObjectProperty': 'measurements.0.timestamp',
                },
            };
            template.dataObjects = ['data.sensors'];
            template.dataPropertyMappings = {
                MeasurePresence: 'measurements.0.value',
            };
        }
        return template;
    } catch (err) {
        winston.log('error', `500 | dsaas | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
        return template;
    }
};

/**
 * Attempts to stream data to external system.
 *
 * @param {Object} template
 * @param {Object} data
 * @return {Object}
 */
const stream = async (template, data) => {
    const result = [];
    try {
        // Extract stream endpoint url and output definitions from config.
        const config = template.config;
        const url = _.get(config, 'plugins.dsaas.url');
        if (!url) return data;

        // Send data to external system.
        for (const d of (Array.isArray(data) ? data : [data])) {
            result.push(await request('POST', `${url}/api/store?code=${_.get(config, 'plugins.dsaas.functionCode')}`, {}, d));
        }
    } catch (err) {
        winston.log('error', `500 | dsaas | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
        throw err;
    }
    return result;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'dsaas',
    template,
    stream,
};
