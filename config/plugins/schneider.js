'use strict';
/**
 * Module dependencies.
 */
// const transformer = require('../../app/lib/transformer');
const winston = require('../../logger.js');
const rp = require('request-promise');
const req = require('request');
// const https = require('https');
// const fs = require('fs');

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
                    parameters.ids[i] = encodeURIComponent(encodeURIComponent(parameters.ids[i]));
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
function request(method, url, headers, body) {
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
        const ids = template.parameters.ids.map(item => decodeURIComponent(decodeURIComponent(item.id)));

        // Create subsciption
        const createSubsciptionUrl = domain + '/Subscriptions/Create';
        const subsciptionBody = {
            SubscriptionType: 'ValueItemChanged',
            Ids: ids,
        };
        const createdSubscription = await request('POST', createSubsciptionUrl, options.headers, subsciptionBody);
        // console.log('POST, subscription body', createdSubscription.body);

        // Create notification
        const createNotificationUrl = domain + '/Notifications/Create';
        const notificationBody = {
            SubscriptionId: createdSubscription.body.Id,
            ChangesOnly: false,
        };
        const createdNotification = await request('POST', createNotificationUrl, options.headers, notificationBody);
        // console.log('POST, notification body', createdNotification.body);

        // Get notification
        const getNotificationUrl = domain + '/Notifications/' + createdNotification.body.Id + '/Items';
        const fetchedNotification = await request('GET', getNotificationUrl, options.headers);
        console.log('GET, notification body', fetchedNotification.body);

        // Delete notification
        const deleteNotificationUrl = domain + '/Notifications/' + createdNotification.body.Id + '/Delete';
        const deletedNotification = await request('DELETE', deleteNotificationUrl, options.headers);
        console.log('DELETE, notification body', deletedNotification.body);

        // Delete subsciption
        const deleteSubscriptionUrl = domain + '/Subscriptions/' + createdSubscription.body.Id + '/Delete';
        const deletedSubscription = await request('DELETE', deleteSubscriptionUrl, options.headers);
        console.log('DELETE, subscription body', deletedSubscription.body);

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
    name: 'schneider',
    parameters,
    template,
};
