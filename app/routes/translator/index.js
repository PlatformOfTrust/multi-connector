'use strict';
/**
 * Module dependencies.
 */

const router = require('express').Router();

/**
 * Version routes.
 */
module.exports = function (passport) {

    /** V1 endpoints. */
    router.use('/:version/', require('./v1')(passport));
    router.param('version', (req, res, next, version) => {
        console.log(version);
        req.version = version;
        next();
    });

    return router;
};
