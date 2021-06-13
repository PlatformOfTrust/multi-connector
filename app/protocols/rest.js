'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const response = require('../lib/response');
const rp = require('request-promise');
const _ = require('lodash');

/**
 * REST library.
 *
 * Handles API request composition and response error handling.
 */

/**
 * Returns promise reject with error.
 *
 * @param {Number} [code]
 * @param {String/Object} [msg]
 *   Error message.
 * @param {String} [reference]
 *   Additional info about the cause of the error.
 * @return {Promise}
 */
const promiseRejectWithError = function (code, msg, reference) {
    const err = new Error();
    err.httpStatusCode = code || 500;
    err.reference = reference;
    err.message = msg || 'Internal Server Error.';
    return Promise.reject(err);
};

/**
 * Sends data request. Configures authentication of the request.
 *
 * @param {Object} config
 * @param {Object} options
 * @param {String} path
 * @return {Promise}
 */
const getDataByOptions = async (config, options, path) => {
    if (!config.url && !path) {
        return promiseRejectWithError(500, 'No url or path found in authConfig.');
    } else {
        // Compose query string.
        let queryString = '';
        if (options.query.length > 0) {
            queryString += '?';
            for (let i = 0; i < options.query.length; i++) {
                if (_.isObject(options.query[i])) {
                    const entries = Object.entries(options.query[i]);
                    entries.forEach(entry => queryString += entry[0] + '=' + entry[1] + '&');
                }
            }

            if (queryString[queryString.length - 1] === '&') {
                queryString = queryString.slice(0, -1);
            }

            // Check whether the URL already contains query entries.
            const entries = [];
            for (const entry of new URL(options.url).searchParams.keys()) {
                entries.push(entry);
            }
            if (entries.length > 0) queryString = '&' + queryString.substr(1);

            // Attach query.
            options.url += queryString;
        }

        return rp({...options, query: undefined}).then(function (result) {
            return Promise.resolve(result);
        }).catch(function (err) {
            try {
                if (Object.prototype.toString.call(err.response.body) === '[object Uint8Array]') {
                    err.message = Buffer.from(err.response.body).toString();
                }
            } catch (err) {
                return Promise.reject(err);
            }
            return Promise.reject(err);
        });
    }
};

/**
 * Handles erroneous response.
 *
 * @param {Object} config
 * @param {Error} err
 * @return {Promise}
 */
const handleError = async (config, err) => {
    winston.log('info', config.authConfig.template + ': Response with status code ' + err.statusCode);

    /** Connection error handling. */
    if (err.statusCode === 500
        || err.statusCode === 502
        || err.statusCode === 503
        || err.statusCode === 504
        || err.statusCode === 522
    ) {
        return promiseRejectWithError(err.statusCode, err.message);
    }

    // Execute onerror plugin function.
    for (let i = 0; i < config.plugins.length; i++) {
        if (config.plugins[i].onerror) {
            return await config.plugins[i].onerror(config, err);
        }
    }

    // Give up.
    return promiseRejectWithError(err.statusCode, 'Internal Server Error.');
};

/**
 * Initiates data requests.
 *
 * @param {Object} config
 * @param {String} pathArray
 *   Resource path, which will be included to the resource url.
 * @return {Array}
 */
const getData = async (config, pathArray) => {
    const items = [];
    for (let p = 0; p < pathArray.length; p++) {
        const item = await requestData(config, pathArray[p], p);
        if (item) items.push(item);
    }
    return items;
};

/**
 * Parses body object from API response.
 *
 * @param {Object} response
 * @return {Object}
 */
const parseResBody = function (response) {
    let body = {};
    try {
        body = JSON.parse(response.body);
    } catch (err) {
        return response;
    }
    return body;
};

/**
 * Structures required information for data request.
 *
 * @param {Object} config
 * @param {String} path
 *   Resource path, which will be included to the request.
 * @param {Number} index
 * @return {Promise}
 */
const requestData = async (config, path, index) => {
    // Initialize request options.
    let options = {
        method: config.authConfig.method || 'GET',
        url: path.includes('://') ? path : config.authConfig.url + path,
        body: config.authConfig.body || undefined,
        headers: config.authConfig.headers || {},
        resolveWithFullResponse: true,
        query: [],
        gzip: true,
        encoding: null,
    };

    // Define start and end query properties
    if (config.generalConfig.query) {
        if (config.generalConfig.query.start) {
            options.query.push({
                [config.generalConfig.query.start]: new Date(config.parameters.start).toISOString(),
            });
        }
        if (config.generalConfig.query.end) {
            options.query.push({
                [config.generalConfig.query.end]: new Date(config.parameters.end).toISOString(),
            });
        }
        if (config.generalConfig.query.properties) {
            for (const property in config.generalConfig.query.properties) {
                if (Object.hasOwnProperty.call(config.generalConfig.query.properties, property)) {
                    options.query.push(config.generalConfig.query.properties[property]);
                }
            }
        }
    }

    // Execute request plugin function.
    for (let i = 0; i < config.plugins.length; i++) {
        if (config.plugins[i].request) {
            options = await config.plugins[i].request(config, options);
        }
    }

    /** First attempt */
    return getDataByOptions(config.authConfig, options, path).then(function (result) {
        // Handle received data.
        if (result !== null) return response.handleData(config, path, index, parseResBody(result));
        // Handle connection timed out.
        return promiseRejectWithError(522, 'Connection timed out.');
    }).then(function (result) {
        // Return received data.
        return Promise.resolve(result);
    }).catch(function (err) {
        if (Object.hasOwnProperty.call(err, 'statusCode')) {
            if (err.statusCode === 404) {
                return Promise.resolve([]);
            }
        }
        return handleError(config, err).then(function () {
            /** Second attempt */
            // If error handler recovers from the error, another attempt is initiated.
            return getDataByOptions(config.authConfig, options, path);
        }).then(function (result) {
            // Handle received data.
            if (result !== null) return response.handleData(config, path, index, parseResBody(result));
            // Handle connection timed out.
            return promiseRejectWithError(522, 'Connection timed out.');
        }).then(function (result) {
            // Return received data.
            return Promise.resolve(result);
        }).catch(function (err) {
            if (Object.hasOwnProperty.call(err, 'statusCode')) {
                if (err.statusCode === 404 || err.statusCode === 400) {
                    return Promise.resolve([]);
                }
            }
            return Promise.reject(err);
        });
    });
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
    promiseRejectWithError,
};
