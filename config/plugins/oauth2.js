"use strict";
/**
 * Module dependencies.
 */
const cache = require('../../app/cache');
const rp = require('request-promise');

/**
 * OAuth2 authentication plugin.
 */

/**
 * Returns promise reject with error.
 *
 * @param {Number} [code]
 * @param {String} [msg]
 *   Error message.
 * @param {String} [reference]
 *   Additional info about the cause of the error.
 * @return {Promise}
 */
const promiseRejectWithError = function (code, msg, reference) {
    let err = new Error(msg || 'Internal Server Error.');
    err.httpStatusCode = code || 500;
    err.reference = reference;
    return Promise.reject(err);
};

/**
 * Attempts to update access token.
 *
 * @param {Object} authConfig
 * @param {Boolean} [refresh]
 *   Whether refresh token should be used or not.
 * @return {Promise/PromiseRejectionEvent}
 *    Returns promise resolve if grant was updated successfully.
 */
const updateToken = async (authConfig, refresh) => {
    // Request new token with selected grant type.
    let grant = refresh ? await requestToken(authConfig, true) : await requestToken(authConfig);
    if (!grant) return promiseRejectWithError(500, 'Authentication failed.');
    return Promise.resolve();
};

/**
 * Sends authentication request with credentials.
 *
 * @param {Object} authConfig
 * @return {Promise}
 */
function getTokenWithPassword(authConfig) {
    let onlyClientAuth;
    let onlyUserAuth;
    if (!authConfig.username || !authConfig.password || !authConfig.clientId || !authConfig.clientSecret) {
        if (!authConfig.username && !authConfig.password && authConfig.clientId && authConfig.clientSecret) {
            onlyClientAuth = true;
        } else if (!authConfig.clientId && !authConfig.clientSecret && authConfig.username && authConfig.password) {
            onlyUserAuth = true;
        } else return promiseRejectWithError(500, 'No credentials found in authConfig.');
    }

    let options = {
        method: 'POST',
        url: authConfig.url + authConfig.authPath,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form:
            {
                grant_type: 'password',
                username: authConfig.username,
                password: authConfig.password,
                client_id: authConfig.clientId,
                client_secret: authConfig.clientSecret,
                scope: authConfig.scope || ''
            },
        resolveWithFullResponse: true
    };

    if (onlyClientAuth) {
        delete options.form.username;
        delete options.form.password;
        delete options.form.scope;
        options.form.grant_type = 'client_credentials'
    }

    if (onlyUserAuth) {
        delete options.form.client_id;
        delete options.form.client_secret;
        delete options.form.scope;
        options.form.grant_type = 'password'
    }

    if (Object.hasOwnProperty.call(authConfig, 'authContentType')) {
        options.headers['content-type'] = authConfig.authContentType;
        // In case json is used as content type instead of form.
        if (authConfig.authContentType === 'application/json') {
            options.body = options.form;
            options.json = true;
            delete options.form;
        }
    }

    return rp(options).then(function (result) {
        return Promise.resolve(result);
    }).catch(function (err) {
        return Promise.reject(err);
    });
}

/**
 * Sends grant refresh request to retrieve new access token.
 *
 * @param {Object} authConfig
 * @param {String} refreshToken
 * @return {Promise}
 */
function getTokenWithRefreshToken(authConfig, refreshToken) {
    if (!authConfig.url && !authConfig.authPath) {
        return promiseRejectWithError(500, 'No url or authPath found in authConfig.');
    } else {
        let options = {
            method: 'POST',
            url: authConfig.url + authConfig.authPath + '/token',
            headers:
                {
                    'content-type': 'application/x-www-form-urlencoded'
                },
            form:
                {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: authConfig.clientId,
                    client_secret: authConfig.clientSecret
                },
            resolveWithFullResponse: true
        };

        /** Philips HUE specific refresh. */
        if (authConfig.url === 'https://api.meethue.com') {
            delete options.form.grant_type;
            delete options.form.client_id;
            delete options.form.client_secret;
            options.headers = {
                Authorization: 'Basic '
                    + Buffer.from(authConfig.clientId + ':' + authConfig.clientSecret).toString('base64')
            };
            options.url = authConfig.url + authConfig.authPath + '/refresh?grant_type=refresh_token';
        }

        return rp(options).then(function (result) {
            return Promise.resolve(result);
        }).catch(function (err) {
            return Promise.reject(err);
        });
    }
}

/**
 * Initiates request to acquire access token.
 *
 * @param {Object} authConfig
 * @param {Boolean} [refresh]
 *   Whether refresh token should be used or not.
 * @return {Promise} Grant
 */
function requestToken(authConfig, refresh) {
    // Get grant from cache (only for refresh purposes)
    let grant;
    grant = cache.getDoc('grants', authConfig.template);
    if (!grant) grant = {};

    return (refresh && grant.refresh_token
            ? getTokenWithRefreshToken(authConfig, grant.refresh_token)
            : getTokenWithPassword(authConfig)
    ).then(function (result) {
        let body;
        if (result) {
            if (Object.hasOwnProperty.call(result, 'body')) {
                try {
                    body = result.body;
                    body = JSON.parse(result.body);
                } catch (e) {}
                cache.setDoc('grants', authConfig.template, body);
            }
            return Promise.resolve(body);
        }
        return Promise.resolve()
    }).catch(function (err) {
        return onerror(authConfig, err).then(function (result) {
            /** Second attempt was successful. */
            return Promise.resolve(result);
        }).catch(function (err) {
            /** Second attempt failed. */
            return Promise.reject(err);
        });
    });
}

/**
 * Handles erroneous response.
 *
 * @param {Object} authConfig
 * @param {Error} err
 * @return {Promise}
 */
const onerror = async (config, err) => {
    switch (err.statusCode) {
        /** 401 - Unauthorized. */
        case 401:
            /** Philips HUE specific response handling. */
            if (config.authConfig.url === 'https://api.meethue.com') {
                return updateToken(config.authConfig, true);
            } else {
                return updateToken(config.authConfig, false);
            }
        /** 403 - Token expired. */
        case 403:
            return updateToken(config.authConfig, true);
        /** 400 - Invalid credentials / Access token is missing */
        case 400:
            return promiseRejectWithError(err.statusCode, 'Authentication failed.');
    }
    return promiseRejectWithError(err.statusCode, 'Authentication failed.');
};

module.exports = {
    name: 'oauth2',
    request: async (config, options) => {
        // Check for necessary information.
        if (!config.authConfig.authPath || !config.authConfig.url) {
            return promiseRejectWithError(500, 'Insufficient authentication configurations.');
        }

        // Check for existing grant.
        let grant = cache.getDoc('grants', config.authConfig.template);
        if (!grant) grant = {};
        if (!Object.hasOwnProperty.call(grant, 'access_token')
            && !Object.hasOwnProperty.call(grant, 'token')) {
            // Request access token.
            grant = await requestToken(config.authConfig);
            if (!grant.access_token && !grant.token) return promiseRejectWithError(500, 'Authentication failed.');
        }

        // Authorize request.
        options.headers.Authorization = 'Bearer ' + (grant.access_token || grant.token);

        return options;
    },
    /** Request error handling. */
    onerror
};
