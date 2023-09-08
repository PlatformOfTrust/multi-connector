'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rp = require('request-promise');

/**
 * Schneider id double encoding.
 */

/**
 * Manipulates request parameters.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'ids')) {
            if (Array.isArray(parameters.ids)) {
                for (let i = 0; i < parameters.ids.length; i++) {
                    parameters.ids[i] = encodeURIComponent(encodeURIComponent(parameters.ids[i].id || parameters.ids[i].idLocal || parameters.ids[i]));
                }
            }
        }
        return parameters;
    } catch (err) {
        return parameters;
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
 * Manipulates output.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    try {
        if ((config.schema || '').includes('measure-water-meter-reading')) {
            // Handle hot and cold water categorization.
            output.data.process = output.data.process.map(a => ({...a, measurements: a.measurements.map(b => ({
                ...b,
                '@type':  a.id.toLowerCase().includes('lämmin') ? 'MeasureWaterHotConsumptionLitre' : b['@type'],
            }))}));
        }
        return output;
    } catch (err) {
        return output;
    }
};

/**
 * Call endpoint without waiting for the response.
 *
 * @param {Object} options
 */
const fireAndForget = async (options) => {
    try {
        await request(options.method, options.url, options.headers);
    } catch (err) {
        //
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
        if ((config.schema || '').includes('measure-water-meter-reading')) {
            // Change output array key to process.
            template.output = {array: 'process'};
        }
        if (template.mode === 'history') {
            const take = Math.pow(2, 31) - 1; // Maximum positive value for a 32-bit signed binary integer.
            template.authConfig.path = template.authConfig.path.map(p => p.replace('/Values/', '/TrendSamples/?take=' + take + '&trendId='));
            template.generalConfig.hardwareId = {dataObjectProperty: 'TrendId'};
            template.generalConfig.timestamp = {dataObjectProperty: 'SampleDate'};
        }
        // Skip subscription if query includes only one id.
        const ids = template.parameters.ids.map(item => decodeURIComponent(decodeURIComponent(item.id)));
        if (ids.length < 5 || template.mode !== 'latest') {
            return template;
        }
        template.parameters.ids = ids;

        const oauth2 = template.plugins.find(p => p.name === 'oauth2');
        if (!oauth2) {
            return Promise.reject();
        }

        template.generalConfig.hardwareId = {dataObjectProperty: 'ChangedItemId'};
        template.generalConfig.timestamp = {dataObjectProperty: 'ChangedAt'};
        template.protocol = 'custom';

        const options = await oauth2.request(template, {});
        const domain = template.authConfig.url;
        const chunkSize = 200;

        // Initialize data array.
        template.authConfig.path = [];

        for (let i = 0; i < ids.length; i += chunkSize) {
            try {
                const chunk = ids.slice(i, i + chunkSize);
                // Create subscription.
                const createSubscriptionBodyUrl = domain + '/Subscriptions/Create';
                const SubscriptionBody = {
                    SubscriptionType: 'ValueItemChanged',
                    Ids: chunk,
                };
                const createdSubscription = await request('POST', createSubscriptionBodyUrl, options.headers, SubscriptionBody);

                // Create notification.
                const createNotificationUrl = domain + '/Notifications/Create';
                const notificationBody = {
                    SubscriptionId: createdSubscription.body.Id,
                    ChangesOnly: false,
                };
                const createdNotification = await request('POST', createNotificationUrl, options.headers, notificationBody);

                // Get notification.
                const getNotificationUrl = domain + '/Notifications/' + createdNotification.body.Id + '/Items';
                const {body} = await request('GET', getNotificationUrl, options.headers);

                template.authConfig.path = [...template.authConfig.path, ...(Array.isArray(body) ? body : [])];

                fireAndForget({
                    method: 'DELETE',
                    url: `${domain}/Notifications/${((createdNotification || {}).body|| {}).Id}/Delete`,
                    headers: options.headers,
                });
                fireAndForget({
                    method: 'DELETE',
                    url: `${domain}/Subscriptions/${((createdSubscription || {}).body|| {}).Id}/Delete`,
                    headers: options.headers,
                });
            } catch (err) {
                winston.log('error', `${config.productCode ? `${config.productCode} | ` : ''}${err.message}`);
            }
        }
    } catch (err) {
        winston.log('error', `${config.productCode ? `${config.productCode} | ` : ''}${err.message}`);
        return template;
    }
    return template;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'schneider',
    parameters,
    template,
    output,
};
