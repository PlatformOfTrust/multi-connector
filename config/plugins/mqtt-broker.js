"use strict";
/**
 * Module dependencies.
 */
const aedes = require('aedes');
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
    const server = require('net').createServer(instance.handle);

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

    // Start broker.
    try {
        const port = 1883
        server.listen(port, function () {
            winston.log('info', options.productCode
                + ' MQTT broker started and listening on port ' + port);
            if (callback) callback(config, options.productCode);
        })
    } catch (err) {
        console.log(err.message);
    }

    return server;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'mqtt-broker',
    connect
};
