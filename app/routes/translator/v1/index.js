'use strict';
/**
 * Module dependencies.
 */
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

    /** Public key.
     *
     * @swagger
     * /translator/v1/public.key:
     *   get:
     *     description: Public RSA key.
     *     produces:
     *       - application/octet-stream; charset=utf-8
     *     responses:
     *       200:
     *         description: Key file.
     */
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

    /** Plugins.
     *
     * @swagger
     * /translator/v1/plugins:
     *   post:
     *     description: Dynamic endpoint for plugins.
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Action completed.
     */
    router.use('/plugins/', require('./plugins')(passport));

    /** Hooks.
     *
     * @swagger
     * /translator/v1/hooks:
     *   post:
     *     description: Dynamic endpoint for hooks.
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Action completed.
     */
    router.use('/hooks/', require('./hooks')(passport));

    // Initialize swagger-jsdoc -> returns validated swagger spec in json format.
    const swaggerSpec = swaggerJSDoc({
        swaggerDefinition: {
            info: {
                title: 'Connector',
                version: '1.0.0',
                description: 'HTTP server to handle Platform of Trust Broker API requests.',
            },
            basePath: '/',
        },
        apis: [
            './app/routes/translator/v1/index.js',
        ],
    });

    /** Swagger Documentation. */
    router.get('/swagger.json', function (req, res) {
        swaggerSpec.host = req.get('host');
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    /** Swagger UI. */
    router.use('/api-docs', swaggerUi.serve);
    router.get('/api-docs', function (req, res, next) {
        swaggerSpec.host = req.get('host');
        req.swaggerDoc = swaggerSpec;
        next();
    }, swaggerUi.serve, swaggerUi.setup(null, {
        explorer: false,
    }));

    return router;
};
