'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rp = require('request-promise');
const _ = require('lodash');

/**
 * Salesforce plugin.
 */

const schema = {
    '$id': 'https://standards.oftrust.net/v2/Schema/DataProductOutput/ServiceRequest?v=2.1',
    'properties': {
        'data': {
            'type': 'object',
            'properties': {
                'serviceRequest': {
                    'source': 'data.value',
                    'type': 'string',
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
 * Map status.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        if (_.get(response, 'Status')) {
            switch (response.Status) {
                case 'New':
                    response.Status = 'New';
                    break;
                case 'Closed':
                    response.Status = 'Completed';
                    break;
                case 'In Progress':
                    response.Status = 'Ongoing';
                    break;
            }
        }
        return response;
    } catch (e) {
        return response;
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
        const oauth2 = template.plugins.find(p => p.name === 'oauth2');
        if (!oauth2) {
            return Promise.reject();
        }
        const options = await oauth2.request(template, {});
        const domain = template.authConfig.url;

        if (_.get(template.parameters, 'targetObject.@type')) {
            if (_.get(template.parameters, 'targetObject.idLocal')) {
                // Update document.
                // /services/data/v{{version}}/sobjects/:SOBJECT_API_NAME/:RECORD_ID
                const update = {};
                if (_.get(template.parameters, 'targetObject.status.0.name')) {
                    update.Status = template.parameters.targetObject.status[0].name;
                    switch (update.Status) {
                        case 'New':
                            update.Status = 'New';
                            break;
                        case 'Completed':
                            update.Status = 'Closed';
                            break;
                        case 'Ongoing':
                            update.Status = 'In Progress';
                            break;
                    }
                }
                if (_.get(template.parameters, 'targetObject.process.additionalInformation')) {
                    update.Comments = template.parameters.targetObject.process.additionalInformation;
                }
                if (!_.isEmpty(update)) {
                    const url = domain + template.authConfig.path.replace('updated/', template.parameters.targetObject.idLocal);
                    await request('PATCH', url, {...options.headers, 'Content-Type': 'application/json'}, update);
                    winston.log('info', 'Updated ' + template.parameters.targetObject.idLocal);
                }
                template.authConfig.path = template.parameters.targetObject;
                template.schema = schema;
                template.protocol = 'custom';
            } else {
                // Create document.
                // /services/data/v{{version}}/sobjects/:SOBJECT_API_NAME/
                const requestor = _.get(template.parameters, 'targetObject.requestor.name');
                const doc = {
                    'AccountId': _.get(template.parameters, 'targetObject.location.organization.idLocal'),
                    'Status': 'New',
                    'Reason': 'Maintenance_Request',
                    'Origin': 'Integration',
                    'Subject': _.get(template.parameters, 'targetObject.name'),
                    'Priority': 'Medium',
                    'Description': `${_.get(template.parameters, 'targetObject.descriptionGeneral')}${requestor ? ' /' + requestor : ''}`,
                    'Comments': _.get(template.parameters, 'targetObject.process.additionalInformation'),
                };
                const url = domain + template.authConfig.path.replace('updated/', '');
                const {body} = await request('POST', url, {...options.headers, 'Content-Type': 'application/json'}, doc);
                template.authConfig.path = template.parameters.targetObject;
                template.schema = schema;
                template.protocol = 'custom';
                winston.log('info', 'Created ' + JSON.stringify(body));
                template.authConfig.path.idLocal = body.id;
            }
        } else {
            let url = template.authConfig.path.map(p => domain + p)[0];
            if (!url) {
                template.schema = schema;
                template.protocol = 'custom';
            } else {
                if (_.get(template, 'generalConfig.query.start')) {
                    url += `?${template.generalConfig.query.start}=${new Date(template.parameters.start).toISOString().split('.')[0]}Z`;
                }
                if (_.get(template, 'generalConfig.query.end')) {
                    url += `&${template.generalConfig.query.end}=${new Date(template.parameters.end).toISOString().split('.')[0]}Z`;
                }

                const {body} = await request('GET', url, options.headers);
                template.parameters.ids = body['ids'];
                template.authConfig.path = body['ids'].map(id => url.replace('updated/', id));
            }
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
    name: 'salesforce',
    template,
    response
};
