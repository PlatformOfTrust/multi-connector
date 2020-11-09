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
    router.use('/v1/', require('./v1')(passport));

    return router;
};
