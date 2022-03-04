'use strict';
/**
 * Basic authentication plugin.
 */

/**
 * Composes authorization header and
 * includes it to the http request options.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    try {
        // Initialize headers if required.
        if (!Object.hasOwnProperty.call(options, 'headers')) {
            options.headers = {};
        }
        // Authorize request.
        options.headers['Authorization'] = 'Basic ' + Buffer.from(config.authConfig.username + ':' + config.authConfig.password).toString('base64')
    } catch (err) {
        console.log(err.message);
    }
    return options;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'basic',
    request,
};
