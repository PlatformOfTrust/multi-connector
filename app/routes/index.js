'use strict';
/**
 * Module dependencies.
 */
const net = require('net');
const cors = require('cors');
const router = require('express').Router();

/**
 * Root routes.
 */
module.exports.app = function (app, passport) {
    /** Include before other routes. */
    app.options('*', cors());

    /** Translator endpoints. */
    router.use('/:path/', require('./translator/index')(passport));
    router.param('path', (req, res, next, path) => {
        const host = req.get('host').split(':')[0];
        const url = (host === 'localhost' || net.isIP(host) ? 'http' : 'https') + '://' + req.get('host') + req.baseUrl;
        req.connectorUrl = process.env.CONNECTOR_URL || url;
        req.publicKeyUrl = `${req.connectorUrl}/${path}/v1/public.key`;
        next();
    });

    /** Default endpoint. */
    router.use('', (req, res) => {
        return res.status(404).json({
            error: {
                status: 404,
                message: 'Not Found',
            },
        });
    });

    // Attach router.
    app.use('', router);
};
