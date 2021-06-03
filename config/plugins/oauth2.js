'use strict';
/**
 * Module dependencies.
 */
const router = require('express').Router();
const cache = require('../../app/cache');
const rp = require('request-promise');
const crypto = require('crypto');

/**
 * OAuth2 authentication plugin.
 */

// Store failed authorization attempts.
const failures = {};

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
    const err = new Error(msg || 'Internal Server Error.');
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
    // Create a property for attempt count, which will be used to limit the number of update attempts.
    if (!Object.hasOwnProperty.call(authConfig, 'attempt')) {
        authConfig.attempt = 0;
    }

    authConfig.attempt++;

    // Limit the number of attempts after error to 3 times.
    if (authConfig.attempt) {
        if (authConfig.attempt > 3) {
            return promiseRejectWithError(500, 'Authentication failed.');
        }
    }

    // Request new token with selected grant type.
    const grant = refresh ? await requestToken(authConfig, true) : await requestToken(authConfig);
    if (!grant) return promiseRejectWithError(500, 'Authentication failed.');
    return Promise.resolve();
};

/**
 * Sends authentication request with credentials.
 *
 * @param {Object} authConfig
 * @return {Promise}
 */
function getTokenWithPassword (authConfig) {
    let onlyClientAuth;
    let onlyUserAuth;
    if (!authConfig.username || !authConfig.password || !authConfig.clientId || !authConfig.clientSecret) {
        if (!authConfig.username && !authConfig.password && authConfig.clientId && authConfig.clientSecret) {
            onlyClientAuth = true;
        } else if (!authConfig.clientId && !authConfig.clientSecret && authConfig.username && authConfig.password) {
            onlyUserAuth = true;
        } else return promiseRejectWithError(500, 'No credentials found in authConfig.');
    }

    const options = {
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
                scope: authConfig.scope || '',
            },
        resolveWithFullResponse: true,
    };

    if (onlyClientAuth) {
        delete options.form.username;
        delete options.form.password;
        delete options.form.scope;
        options.form.grant_type = 'client_credentials';
    }

    if (onlyUserAuth) {
        delete options.form.client_id;
        delete options.form.client_secret;
        delete options.form.scope;
        options.form.grant_type = 'password';
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
function getTokenWithRefreshToken (authConfig, refreshToken) {
    if (!authConfig.url && !authConfig.authPath) {
        return promiseRejectWithError(500, 'No url or authPath found in authConfig.');
    } else {
        const options = {
            method: 'POST',
            url: authConfig.url + authConfig.authPath + '/token',
            headers:
                {
                    'content-type': 'application/x-www-form-urlencoded',
                },
            form:
                {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: authConfig.clientId,
                    client_secret: authConfig.clientSecret,
                },
            resolveWithFullResponse: true,
        };

        /** Philips HUE specific refresh. */
        if (authConfig.url === 'https://api.meethue.com') {
            delete options.form.grant_type;
            delete options.form.client_id;
            delete options.form.client_secret;
            options.headers = {
                Authorization: 'Basic '
                    + Buffer.from(authConfig.clientId + ':' + authConfig.clientSecret).toString('base64'),
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
 * Sends authentication request with authorization code.
 *
 * @param {Object} authConfig
 * @return {Promise}
 */
const getTokenWithCode = async (authConfig) => {
    let code = cache.getDoc('codes', authConfig.productCode);
    if (!code) {
        code = authConfig.code;
    }

    const redirectURL = authConfig.connectorURL + '/translator/v1/plugins/oauth2/' + authConfig.productCode + '/redirect';
    const internalAuthorizeURL = authConfig.connectorURL + '/translator/v1/plugins/oauth2/' + authConfig.productCode + '/authorize';

    if (!code) {
        // Return authorization link.
        return promiseRejectWithError(500,
            'Auhthentication failed. Visit ' + internalAuthorizeURL,
            'getTokenWithCode');
    }

    const options = {
        method: 'POST',
        url: authConfig.url + authConfig.authPath + '/token',
        headers:
            {
                'cache-control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        form:
            {
                grant_type: 'authorization_code',
                code: code,
                client_id: authConfig.clientId,
                client_secret: authConfig.clientSecret,
                redirect_uri: redirectURL,
            },
        resolveWithFullResponse: true,
    };

    return rp(options).then(function (result) {
        return Promise.resolve(result);
    }).catch(function (error) {
        return Promise.reject(error);
    });
};

/**
 * Initiates request to acquire access token.
 *
 * @param {Object} authConfig
 * @param {Boolean} [refresh]
 *   Whether refresh token should be used or not.
 * @return {Promise} Grant
 */
const requestToken = async (authConfig, refresh) => {
    // Get grant from cache (only for refresh purposes)
    let grant;
    let grantType;
    grant = cache.getDoc('grants', authConfig.productCode);
    if (!grant) grant = {};

    // Check for grant type.
    if (Object.hasOwnProperty.call(authConfig, 'grantType')) {
        grantType = authConfig.grantType;
    }

    return (refresh && grant.refresh_token
        ? getTokenWithRefreshToken(authConfig, grant.refresh_token)
        : (grantType !== 'authorization_code' ? getTokenWithPassword(authConfig) : getTokenWithCode(authConfig))
    ).then(function (result) {
        let body;
        if (result) {
            if (Object.hasOwnProperty.call(result, 'body')) {
                try {
                    body = result.body;
                    body = JSON.parse(result.body);
                } catch (err) {
                    console.log(err.message);
                }
                cache.setDoc('grants', authConfig.productCode, body);
            }
            return Promise.resolve(body);
        }
        return Promise.resolve();
    }).catch(function (err) {
        return onerror(authConfig, err).then(function (result) {
            /** Second attempt was successful. */
            return Promise.resolve(result);
        }).catch(function (err) {
            /** Second attempt failed. */
            return Promise.reject(err);
        });
    });
};

/**
 * Handles erroneous response.
 *
 * @param {Object} authConfig
 * @param {Error} err
 * @return {Promise}
 */
const onerror = async (authConfig, err) => {
    /** Internal error. */
    if (err.reference) {
        return promiseRejectWithError(err.statusCode, err.message);
    }

    /** External error. */
    switch (err.statusCode) {
        /** 401 - Unauthorized. */
        case 401:
            /** Philips HUE specific response handling. */
            if (authConfig.url === 'https://api.meethue.com') {
                return updateToken(authConfig, true);
            } else {
                return updateToken(authConfig, false);
            }
        /** 403 - Token expired. */
        case 403:
            return updateToken(authConfig, true);
        /** 400 - Invalid credentials / Access token is missing */
        case 400:
            return promiseRejectWithError(err.statusCode, 'Authentication failed.');
    }
    return promiseRejectWithError(err.statusCode, 'Authentication failed.');
};

const getConfig = function (req, res, next) {
    try {
        const productCode = req.params[0].split('/')[0];
        req.endpoint = req.params[0].split('/')[1];
        const code = req.query['code'];
        const config = cache.getDoc('configs', productCode) || {};
        const template = config ? cache.getDoc('templates', config.template) || {} : {};
        req.authConfig = {...template.authConfig, ...config.static, productCode, code};
        req.authConfig.connectorURL = req.protocol + '://' + req.get('host');
    } catch (err) {
        // Compose error response object.
        const result = {
            error: {
                status: err.httpStatusCode || 500,
                message: err.message || 'Internal Server Error.',
            },
        };

        // Send response.
        return res.status(err.httpStatusCode || 500).send(result);
    }
    next();
};

/** Limiter definitions. */
const MINS10 = 600000, MINS30 = 3 * MINS10;

// Clean limiter.
setInterval(function () {
    for (const ip in failures) {
        if (Date.now() - failures[ip].resetTime > MINS10) {
            delete failures[ip];
        }
    }
}, MINS30);

/**
 * Returns ip address from request.
 *
 * @param {Object} req
 */
const getRemoteIP = function (req) {
    return req.get('x-real-ip') || req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        req.socket.remoteAddress || req.connection.socket.remoteAddress;
};

/**
 * Removes failed authentication attempts on authentication success.
 *
 * @param {Object} req
 */
const authSuccess = function (req) {
    delete failures[getRemoteIP(req)];
};

/**
 * Stores failed authentication attempts.
 *
 * @param {Object} req
 */
const authFailed = function (req) {
    const remoteIP = getRemoteIP(req);
    const f = failures[remoteIP] = failures[remoteIP] || {count: 0, resetTime: new Date()};
    ++f.count;
    // Wait 30 seconds for every failed attempt.
    f.resetTime.setTime(Date.now() + 30000 * f.count);
};

/**
 * Limiter middleware.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const limiter = function (req, res, next) {
    const remoteIp = getRemoteIP(req);
    const f = failures[remoteIp];
    if (f && Date.now() < f.resetTime) {
        req.rateLimit = {
            remaining: 0,
            resetTime: f.resetTime,
        };
    }
    next();
};

/**
 * Returns plugin HTTP endpoints.
 *
 * @param {Object} passport
 * @return {Object}
 */
const endpoints = function (passport) {
    // GET endpoints.
    router.get('/*', getConfig, async (req, res, next) => {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.write('<!doctype html><html>' +
            '<head><title>OAuth2 plugin</title></head>' +
            '<body style="margin-top: 50px; text-align: center;"><h2><b>OAuth2 Authorization</b></h2>');
        /** Pages. */
        switch (req.endpoint) {
            /** Redirect page. */
            case 'redirect':
                let accessToken;
                let token;
                try {
                    accessToken = await requestToken(req.authConfig);
                    token = accessToken.access_token;
                } catch (err) {
                    console.log(err.message);
                }

                if (!token) {
                    const redirectURL = req.protocol + '://' + req.get('host') + '/translator/v1/plugins/oauth2/' + req.authConfig.productCode + '/authorize';
                    res.write(
                        '<h4>Authentication configurator</h4>' +
                        '<p>Authorization failed. Requesting access token with authorization code failed.</p><br><input type="button" onclick="location.href=\'' + redirectURL + '\';" value="Try again" />');
                } else {
                    res.write(
                        '<h4>Access token stored successfully!</h4>' +
                        '<p>Connector authentication configuration is now complete.' +
                        '<br>To avoid the need of doing this again on container redeploy<br>' +
                        'you can store the access token to the environment.<br>To do this follow these instructions: </p>' +
                        '<p>Place the following key and value<br>' +
                        'to a config with product code <code><b>' + req.authConfig.productCode + '</b></code><br>' +
                        'in the environment variable <code><b>CONFIGS</b></code><br></p>' +
                        '<b>accessToken</b>:<br><textarea readonly name="text" cols="25" rows="5">' +
                        token + '</textarea></body></html>');
                }
                break;
            /** Authorize page. */
            case 'authorize':
                res.write('<h4>Authentication configurator</h4>' +
                    '<p>To configure the connector input the following information for identification.</p><br>' +
                    '<form action="?" method="post">' +
                    '<label for="client_secret"><b>clientSecret</b>:</label><br>' +
                    '<input type="text" id="client_secret" name="client_secret" style="margin: 10px"><br>' +
                    '<input type="submit" value="Submit">' +
                    '</form>');
                break;
        }
        res.write('</body></html>');
        res.end();
    });
    // POST endpoints.
    router.post('/*', limiter, getConfig, async (req, res, next) => {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        res.write('<!doctype html><html>' +
            '<head><title>OAuth2 plugin</title></head>' +
            '<body style="margin-top: 50px; text-align: center;"><h2><b>OAuth2 Authorization</b></h2>');
        /** Pages. */
        switch (req.endpoint) {
            /** Authorize page. */
            case 'authorize':
                let message = '<p>Missing parameter <code><b>client_secret</b></code>.</p><br>' +
                    '<button onclick="history.back()" style="margin: 10px">Go Back</button>';
                // Check for rate limiter.
                if (Object.hasOwnProperty.call(req, 'rateLimit')) {
                    if (req.rateLimit.remaining === 0) {
                        message = '<p>Too many failed attempts. Try again in ' + (Math.floor((req.rateLimit.resetTime - Date.now()) / 1000)) + ' seconds.</p><br>' +
                            '<button onclick="history.back()" style="margin: 10px">Go Back</button>';
                        res.write('<h4>Authentication configurator</h4>' +
                            message);
                        break;
                    }
                }

                let clientSecret;
                if (Object.hasOwnProperty.call(req, 'body')) {
                    if (Object.hasOwnProperty.call(req.body, 'client_secret')) {
                        if (req.body.client_secret !== '') {
                            clientSecret = req.body.client_secret;
                            // Validate client secret.
                            if (clientSecret === req.authConfig.clientSecret) {
                                authSuccess(req);
                                const redirectURL = req.protocol + '://' + req.get('host') + '/translator/v1/plugins/oauth2/' + req.authConfig.productCode + '/redirect';
                                // Generate state.
                                const state = crypto.randomBytes(48).toString('hex');
                                // Generate link to authorization page.
                                const authorizationURL = req.authConfig.url + req.authConfig.authPath + '/authorize'
                                    + '?client_id=' + req.authConfig.clientId
                                    + '&response_type=code'
                                    + '&redirect_uri=' + redirectURL
                                    + '&scope=' + req.authConfig.scope
                                    + '&state=' + state;
                                message = 'User authenticated. Visit the following link<br>';
                                message += 'to complete the authorization.<br>';
                                message += '<p><a href="' + authorizationURL + '">Authorize access to resources</a></p>';
                            } else {
                                authFailed(req);
                                message = '<p>Authentication failed. Wrong <code><b>client_secret</b></code>.</p><br>' +
                                    '<button onclick="history.back()" style="margin: 10px">Go Back</button>';
                            }
                        }
                    }
                }
                res.write('<h4>Authentication configurator</h4>' +
                    message);
                break;
        }
        res.write('</body></html>');
        res.end();
    });
    return router;
};

module.exports = {
    name: 'oauth2',
    request: async (config, options) => {
        // Check for necessary information.
        if (!config.authConfig.authPath || !config.authConfig.url) {
            return promiseRejectWithError(500, 'Insufficient authentication configurations.');
        }

        // Check for existing grant.
        let grant = cache.getDoc('grants', config.authConfig.productCode);
        if (!grant && config.authConfig.accessToken) grant = {access_token: config.authConfig.accessToken};
        if (!grant) grant = {};
        if (!Object.hasOwnProperty.call(grant, 'access_token')
            && !Object.hasOwnProperty.call(grant, 'token')) {
            // Request access token.
            grant = await requestToken(config.authConfig);
            if (!grant.access_token && !grant.token) return promiseRejectWithError(500, 'Authentication failed.');
        }

        // Initialize headers if required.
        if (!Object.hasOwnProperty.call(options, 'headers')) {
            options.headers = {};
        }

        // Authorize request.
        options.headers.Authorization = 'Bearer ' + (grant.access_token || grant.token);

        return options;
    },
    /** Request error handling. */
    onerror,
    endpoints,
};
