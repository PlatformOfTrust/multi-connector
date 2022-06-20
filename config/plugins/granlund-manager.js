'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const rp = require('request-promise');
const winston = require('../../logger.js');
const transformer = require('../../app/lib/transformer');
const serviceRequestSchema = require('../schemas/service-request_granlund-manager-v2.1.json');
const maintenanceInformationSchema = require('../schemas/maintenance-information_granlund-manager-v3.2.json');

/**
 * Grandlund Manager transformer.
 */


/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = async (config, id, data) => {
    let object = {};
    try {
        let key;
        for (let j = 0; j < data.length; j++) {
            let result = {};
            if (data[j]['@type'] === 'Case') {
                key = Object.keys(serviceRequestSchema.properties.data.properties)[0];
                const value = data[j][config.output.value];

                // Transform raw input.
                value.type = 'Case';
                value.statusType = 'Status';
                value.statusCodeType = 'StatusCode';
                value.creatorType = 'Organization';
                value.requestorType = 'Person';
                value.parentObjectType = 'Object';
                value.locationType = 'Location';
                value.locationOrganizationType = 'Organization';

                switch (value.Phase) {
                    case 'Undefined':
                        value.Phase = 'New';
                        break;
                    case 'Defined':
                        value.Phase = 'Completed';
                        break;
                    case 'UnderProgress':
                        value.Phase = 'Ongoing';
                        break;
                }

                result = transformer.transform(value, serviceRequestSchema.properties.data);
            } else {
                key = Object.keys(maintenanceInformationSchema.properties.data.properties)[0];
                let value = data[j][config.output.value];

                if (j > 5) {
                    // Resolve jobs.
                    try {
                        const oauth2 = config.plugins.find(p => p.name === 'oauth2');
                        const options = await oauth2.request(config, {});
                        const url = `${config.authConfig.path.split('/').slice(0, 5).join('/')}/maintenance-tasks/${value.Task.Id}`;
                        const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
                        value = body;
                    } catch (err) {
                        winston.log('error', err.message);
                    }
                }
                result = transformer.transform(value, maintenanceInformationSchema.properties.data);
                result[Object.keys(result)[0]][0].raw = value;
                result[Object.keys(result)[0]][0].processTarget = [{idLocal: id}];
            }

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
        if (JSON.stringify(object) === '{}') {
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
                await handleData(
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
 * Switch querying protocol to REST.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        if (_.get(template.parameters, 'targetObject.@type')) {
            if (_.get(template.parameters, 'targetObject.idLocal')) {
                const oauth2 = template.plugins.find(p => p.name === 'oauth2');
                if (!oauth2) {
                    return Promise.reject();
                }
                const options = await oauth2.request(template, {});
                // Update document.
                // /service-requests/{{serviceRequestId}}/Phase
                const update = {};
                if (_.get(template.parameters, 'targetObject.status.0.name')) {
                    update.Phase = template.parameters.targetObject.status[0].name;
                    switch (update.Phase) {
                        case 'New':
                            update.Phase = 'New';
                            break;
                        case 'Completed':
                            update.Phase = 'Defined';
                            break;
                        case 'Ongoing':
                            update.Phase = 'UnderProgress';
                            break;
                    }
                }
                // Comment is required.
                const defaultComment = 'Päivitys';
                if (_.get(template.parameters, 'targetObject.process.additionalInformation')) {
                    update.Comment = template.parameters.targetObject.process.additionalInformation || defaultComment;
                } else {
                    update.Comment = defaultComment;
                }
                if (!_.isEmpty(update)) {
                    const url = template.authConfig.path.split('/').slice(0, 5).join('/') + '/service-requests/' + template.parameters.targetObject.idLocal + '/Phase';
                    const {body} = await request('PUT', url, {...options.headers, 'Content-Type': 'application/json'}, update);
                    winston.log('info', 'Updated ' + template.parameters.targetObject.idLocal);
                    template.authConfig.path = body;
                } else {
                    template.authConfig.path = [];
                }
                template.protocol = 'custom';
            }
        } else if (Object.keys(template.dataPropertyMappings).includes('Process')) {
            // Maintenance Information
            /*
            const oauth2 = template.plugins.find(p => p.name === 'oauth2');
            if (!oauth2) {
                return Promise.reject();
            }
            const options = await oauth2.request(template, {});
            */
            // const url = template.authConfig.path.split('/').slice(0, 5).join('/') + '/favorite-portfolios?onlyFacilitiesAndBuildings=false';
            // const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});

            template.parameters.targetObject.idLocal = Array.isArray(template.parameters.targetObject.idLocal) ? template.parameters.targetObject.idLocal[0] : template.parameters.targetObject.idLocal;
            template.authConfig.path = (Array.isArray(template.authConfig.path) ? template.authConfig.path[0] : template.authConfig.path).split('/').slice(0, 5).join('/') + `/objects/${template.parameters.targetObject.idLocal}/maintenance-plans`;
            // const {body} = await request('GET', url, {...options.headers, 'Content-Type': 'application/json'});
            template.output.contextValue = 'https://standards.oftrust.net/v2/Context/DataProductOutput/MaintenanceInformation/?v=3.2';
            template.output.array = 'maintenanceInformation';
        }
    } catch (err) {
        winston.log('error', err.message);
        return template;
    }
    return template;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'granlund-manager',
    template,
    output,
};
