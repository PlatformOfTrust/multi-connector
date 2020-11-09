'use strict';
/**
 * Module dependencies.
 */
const Hubspot = require('hubspot');

/**
 * Hubspot plugin.
 */

// Initialize object for mapping data product specific clients.
const clients = {};

/**
 * Consumes HubSpot API by given method.
 *
 * @param {Object} config
 * @param {Object/String} res
 * @return {Object}
 *   Response from HubSpot API
 */
const response = async (config, res) => {
    let response;

    /** Data fetching. */
    try {
        // Create client, if it doesn't exist.
        if (!Object.hasOwnProperty.call(clients, config.productCode)) {
            clients[config.productCode] = new Hubspot({
                apiKey: config.authConfig.apikey,
                checkLimit: true, // (Optional) Specify whether to check the API limit on each call. Default: true
            });
        }

        /**
         * Compatible APIs with getById method.
         *
         * - companies
         * - contacts
         * - deals
         * - forms
         * - campaigns
         * - marketingEmail
         */

        // Fetch data.
        response = await clients[config.productCode][config.authConfig.api][config.authConfig.method](res);
    } catch (err) {
        console.log(err.message);
    }
    return response;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'hubspot',
    response,
};
