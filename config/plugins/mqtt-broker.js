'use strict';
/**
 * Module dependencies.
 */
const fs = require('fs');
const aedes = require('aedes');
const ws = require('websocket-stream');
const winston = require('../../logger.js');

/**
 * MQTT broker.
 */

/**
 * Starts MQTT broker.
 *
 * @param {Object} config
 * @param {Object} options
 * @param {Function} callback
 * @return {Object}
 */
const connect = async (config, options, callback) => {
    const instance = aedes();
    let server;

    // Import files for TLS.
    if (Object.hasOwnProperty.call(options, 'tls') && process.env.GREENLOCK_DOMAIN) {
        try {
            options.key = fs.readFileSync('./greenlock.d/live/' + process.env.GREENLOCK_DOMAIN + '/privkey.pem');
            options.cert = fs.readFileSync('./greenlock.d/live/' + process.env.GREENLOCK_DOMAIN + '/cert.pem');
            options.ca = fs.readFileSync('./greenlock.d/live/' + process.env.GREENLOCK_DOMAIN + '/chain.pem');
        } catch (err) {
            winston.log('error', 'Failed to set up MQTT over TLS. ' + err.message);
        }
    }

    // Initiate server.
    if (options.key && options.cert && options.ca) {
        server = require('tls').createServer(options, instance.handle);
    } else {
        server = require('net').createServer(instance.handle);
    }

    // Initialize authentication.
    instance.authenticate = (client, username, password, cb) => {
        // No authentication.
        if (!Object.hasOwnProperty.call(options, 'username')
            || !Object.hasOwnProperty.call(options, 'password')) {
            return cb(null, true);
        }
        // Check credentials.
        if (username && typeof username === 'string'
            && username === options.username) {
            if (password && typeof password === 'object'
                && password.toString() === options.password) {
                cb(null, true);
            }
        } else {
            cb(false, false);
        }
    };

    // Start MQTT/MQTTS broker.
    try {
        const port = options.port || 8881;
        server.listen(port, function () {
            winston.log('info', options.productCode
                + ' MQTT broker started and listening on port ' + port);
            if (callback) callback(config, options.productCode);
        });
    } catch (err) {
        console.log(err.message);
    }

    // Start MQTT-WS broker.
    /*
    try {
        const port = options.port || 8881;
        const httpServer = require('http').createServer();
        ws.createServer({ server: httpServer }, instance.handle);
        httpServer.listen(port, function () {
            winston.log('info', options.productCode
                + ' MQTT broker started and listening on port ' + port);
        })
    } catch (err) {
        console.log(err.message);
    }
    */

    return server;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'mqtt-broker',
    connect,
};
