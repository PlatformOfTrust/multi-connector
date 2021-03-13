'use strict';
const { json } = require('body-parser');
// const { response } = require('express');
const { each, forEach } = require('lodash');
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
       
        return rp(option).then(function (res){
        const pathType = (options.url.split("?")[0]).split("/")[8];
        const newpathType = config.dataPropertyMappings[pathType]!= undefined ? config.dataPropertyMappings[pathType]  : pathType
        options.url=options.url.replace(pathType, newpathType);
        token = res.token;
         options.headers = {
            Authorization: 'Bearer ' + token,
        };
        return options;
     
    });

};


const data = async (config,data, path ) => {
    var  dataType = (path.split("?")[0]).split("/")[5];
    const tmp = {}
    tmp[dataType] = data.type; 
    return tmp;
}

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'senaatti',
    request,
    data,
 };
