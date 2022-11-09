'use strict';
const rp = require('request-promise');

/**
 * Assemblin authentication plugin.
 */

/**
 * Retrieves authorization token and
 * includes it to the http request options.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    try {
        // Compose login request options.
        const data = {
            method: 'POST',
            url: config.authConfig.url + config.authConfig.authPath,
            headers: {'content-type': 'application/x-www-form-urlencoded', ...(typeof config.authConfig.headers !== 'string' ? config.authConfig.headers || {} : {})},
            form:
                {
                    username: config.authConfig.username,
                    password: config.authConfig.password,
                },
            resolveWithFullResponse: true,
        };
        const result = await rp(data);
        const token = result.headers['set-cookie'][0].split(';')[0];
        // Authorize request.
        options.headers = {'Cookie': token};
    } catch (err) {
        console.log(err.message);
    }
    return options;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'assemblin',
    request,
};
