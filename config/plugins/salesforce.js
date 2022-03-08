'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rp = require('request-promise');
const _ = require('lodash');

/**
 * Schneider id double encoding.
 */

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
        const oauth2 = template.plugins.find(p => p.name === 'oauth2');
        if (!oauth2) {
            return Promise.reject();
        }

        const options = await oauth2.request(template, {});
        const domain = template.authConfig.url;
        let url = template.authConfig.path.map(p => domain + p)[0];
        if (_.get(template, 'generalConfig.query.start')) {
            url += `?${template.generalConfig.query.start}=${new Date(template.parameters.start).toISOString().split('.')[0]}Z`;
        }
        if (_.get(template, 'generalConfig.query.end')) {
            url += `&${template.generalConfig.query.end}=${new Date(template.parameters.end).toISOString().split('.')[0]}Z`;
        }

        const {body} = await request('GET', url, options.headers);
        template.parameters.ids = body['ids'];
        template.authConfig.path = body['ids'].map(id => url.replace('updated/', id));

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
};
