'use strict';
/**
 * Module dependencies.
 */
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const https = require('https');

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} [headers]
 * @param {String/Object/Array} [body]
 * @param {Boolean} [resolveWithFullResponse]
 *  @param {Boolean} [rejectUnauthorized]
 * @return {Promise}
 */
module.exports = (method, url, headers = {}, body, resolveWithFullResponse = false, rejectUnauthorized = true) => {
    return fetch(url, {
        method,
        headers,
        agent: !rejectUnauthorized
            ? new https.Agent({
                rejectUnauthorized,
            })
            : undefined,
        body: (body || {}).constructor === Object || (body || {}).constructor === Array ? JSON.stringify(body) : body,
    }).then(async (response) => {
        const result = (response.headers.get('content-type') || '').includes('application/json')
            ? await response.json()
            : ((response.headers.get('content-type') || '').includes('text/plain')
                ? await response.text()
                : await response.arrayBuffer());
        if (response.ok) {
            return resolveWithFullResponse ? {...response, body: result} : result;
        } else {
            const stringified = JSON.stringify(result);
            const message = stringified === '{}' ? response.statusText : stringified;
            const err = new Error(message);
            err.response = {status: response.status, body: (result || {}).error || message};
            throw err;
        }
    }).catch(error => Promise.reject(error));
};
