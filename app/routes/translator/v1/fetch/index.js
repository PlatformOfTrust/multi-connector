'use strict';
/**
 * Module dependencies.
 */
const router = require('express').Router();
const ctrl = require('../../../../controllers/translator');

/** Signature verification. */
const authenticate = (passport, req, res, next) => {
    return passport.authenticate(['signature'], {session: false}, (err, user, info) => {
        if (err) {
            return res.status(err.statusCode || 401).json({error: {status: err.statusCode || 401, message: err.message}});
        } else if (!user) {
            const status = (Array.isArray(info) ? info[0] : info).statusCode || 401;
            const message = (Array.isArray(info) ? info[0] : info).message;
            return res.status(status).json({error: {status, message}});
        } else {
            req.user = user;
            req.authInfo = info;
            next();
        }
    });
};

/**
 * Translator routes.
 */
module.exports = function (passport) {
    const auth = process.env.POT_AUTH_DISABLED === 'true'
        ? (req, res, next) => next()
        : (req, res, next) => authenticate(passport, req, res, next)(req, res, next);

    /** Platform of Trust fetch endpoint. */
    router.post('', auth, ctrl.fetch);
    return router;
};
