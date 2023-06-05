'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const hook = require('../protocols/hook');
const router = require('express').Router();
const winston = require('../../logger.js');

/**
 * Hooks controller.
 */

/** Plugin routers */
const routers = {};
let templates = {};
let routesSet = false;

/**
 * Call connect method.
 *
 * @param {Object} config
 */
const handlePlugins = async (config) => {
    try {
        const plugins = (await connector.resolvePlugins(config.template)).plugins.filter(p => typeof p.connect === 'function');
        for (let i = 0; i < plugins.length; i++) {
            try {
                await plugins[i].connect(config);
            } catch (err) {
                winston.log('error', err.message);
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
};

/**
 * Configures hook by config.
 *
 * @param {Array} entry
 */
const configureHook = async ([productCode, config]) => {
    try {
        if (Object.hasOwnProperty.call(templates, config.template)) {
            config.template = templates[config.template];
            const hookRequired = config.template.protocol === 'hook';
            if (hookRequired) {
                routers[productCode] = hook.endpoints;
                config.productCode = productCode;
                await handlePlugins(config);
            }
        } else {
            winston.log('error', 'Template ' + config.template + ' not found.');
        }
        routesSet = false;
    } catch (err) {
        winston.log('error', err.message);
    }
};

// Set listener for completion of loading.
connector.emitter.on('collections',
    async (collections) => {
        for (let i = 0; i < Object.keys(collections).length; i++) {
            if (Object.keys(collections)[i] === 'templates') {
                templates = Object.values(collections)[i];
            }
        }
        for (let i = 0; i < Object.keys(collections).length; i++) {
            if (Object.keys(collections)[i] === 'configs') {
                const configs = Object.values(collections)[i];
                for (let j = 0; j < Object.entries(configs).length; j++) {
                    await configureHook(Object.entries(configs)[j]);
                }
            }
        }
    });

/**
 * Set dynamic hook routes.
 *
 * @param {Object} passport
 */
const setRoutes = function (passport) {
    for (let i = 0; i < Object.keys(routers).length; i++) {
        try {
            // Define paths for hook endpoints.
            router.use('/' + Object.keys(routers)[i] + '/', Object.values(routers)[i](passport));
            winston.log('info', 'Update hooks (' + Object.keys(routers).length + ')');
        } catch (err) {
            winston.log('error', err.message);
        }
    }
};

/**
 * Expose router.
 */
module.exports.hooks = function (passport) {
    router.use('/', function (req, res, next) {
        // Check if hook routes are available.
        if (!routesSet && Object.keys(routers).length > 0) {
            // Trigger router update.
            setRoutes(passport);
            routesSet = true;
        }
        next();
    });
    return router;
};
