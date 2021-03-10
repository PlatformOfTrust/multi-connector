'use strict';
const { response } = require('express');
/**
 * Basic authentication plugin.
 */
const rp = require('request-promise');
/**
 * Composes authorization header and
 * includes it to the http request options.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    var token;
    const option = {
        method: 'POST',
        url: config.authConfig.url + config.authConfig.authPath,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            email: config.authConfig.email,
            password: config.authConfig.password,
           
        },
        json: true,
    }; 
    return rp(option).then(function (response){
         token = response.token;
         options.headers = {
            Authorization: 'Bearer ' + token,
        };
         return options;
    });

};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'senaatti',
    request,
    
 };
