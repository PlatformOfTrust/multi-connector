'use strict';
/**
 * Module dependencies.
 */
const connector = require('../lib/connector');
const router = require('express').Router();

/**
 * Plugins controller.
 *
 */

/** Plugin routers */
const routers = {};
let routesSet = false;

// Set listener for completion of loading.
connector.emitter.on('plugins',
    async (collections) => {
        for (let i = 0; i < Object.keys(collections).length; i++) {
            if (Object.hasOwnProperty.call(Object.values(collections)[i], 'endpoints')) {
                try {
                    const pluginName = Object.keys(collections)[i];
                    routers[pluginName] = Object.values(collections)[i].endpoints;
                } catch (err) {
                    console.log(err.message);
                }
            }
        }
    });

/**
 * Set dynamic plugin routes.
 *
 * @param {Object} passport
 */
const setRoutes = function (passport) {
    for (let i = 0; i < Object.keys(routers).length; i++) {
        try {
            // Define paths for plugin endpoints.
            router.use('/' + Object.keys(routers)[i] + '/', Object.values(routers)[i](passport));
        } catch (err) {
            console.log(err.message);
        }
    }
};

/**
 * Expose router.
 */
module.exports.plugins = function (passport) {
    router.use('/', function (req, res, next) {
        // Check if plugin routes are available.
        if (!routesSet && Object.keys(routers).length > 0) {
            // Trigger router update.
            setRoutes(passport);
            routesSet = true;
        }
        next();
    });
    return router;
};
