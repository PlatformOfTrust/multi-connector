"use strict";
/**
 * Module dependencies.
 */
const swaggerJSDoc = require('swagger-jsdoc');
const router = require('express').Router();
const rsa = require('../../../lib/rsa');

/**
 * API routes.
 *
 * Application routes are defined in this file.
 * To add new routes, use router.<method>(<route>, <controller.action>)
 * or require index file from desired folder.
 */
module.exports = function (passport) {

    /** Public key. */
    router.get('/public.key', rsa.sendPublicKey);

    /** Status.
     *
     * @swagger
     * /translator/v1/health:
     *   get:
     *     description: Health check.
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Server up and running.
     */
    router.use('/health/', require('./health')(passport));

    /** Translator.
     *
     * @swagger
     * /translator/v1/fetch:
     *   post:
     *     description: Returns data.
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Data fetched successfully.
     */
    router.use('/fetch/', require('./fetch')(passport));

    /** Swagger documentation. */
    router.get('/swagger.json', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerJSDoc({
            swaggerDefinition: {
                info: {
                    title: 'Connector',
                    version: '1.0.0',
                    description: 'HTTP server to handle Platform of Trust Broker API requests.',
                },
                basePath: '/',
                host: req.protocol + '://' + req.get('host'),
            },
            apis: [
                './app/routes/translator/v1/index.js'
            ]
        }));
    });

    return router;
};
