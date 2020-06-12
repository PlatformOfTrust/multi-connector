"use strict";
/**
 * Module dependencies.
 */
const router = require('express').Router();
const ctrl = require('../../../../controllers/translator');

/**
 * Translator routes.
 */
module.exports = function (passport) {
    /** Signature verification. */
    let auth = passport.authenticate(['signature'], {session: false});

    /** Platform of Trust fetch endpoint. */
    router.post('', auth, ctrl.fetch);

    return router;
};
