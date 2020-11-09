'use strict';
/**
 * Module dependencies.
 */
const cache = require('../cache');
const rsa = require('../lib/rsa');
const SignatureStrategy = require('./strategies/signature').SignatureStrategy;

/**
 * Passport authentication configurations.
 *
 * Configures strategies, which are extensible set of plugins.
 */

/** Import Platform of Trust definitions. */
const {supportedHeaders} = require('../../config/definitions/request');

/**
 * Extracts identity id from token.
 *
 * @param {String} token
 * @return {String}
 *   User or app id.
 */
const extractId = function (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('binary')).sub;
};

/**
 * Expose passport configurations.
 */
module.exports = function (passport) {
    /**
     * Configures passport signature strategy.
     */
    passport.use('signature', new SignatureStrategy({
        passReqToCallback: true,
    },
    function (req, signature, done) {
        /** Header validation */
        for (const header in supportedHeaders) {
            if (Object.hasOwnProperty.call(supportedHeaders, header)) {
                if (!Object.hasOwnProperty.call(req.headers, header)) {
                    if (supportedHeaders[header].required) return done(null, false, {message: 'Missing required header ' + header});
                }
            }
        }

        /** Signature validation */
        let verified = false;
        let environment;
        const publicKeys = (cache.getDocs('publicKeys') || []).sort((a, b) => (a.priority > b.priority) ? 1 : -1);

        // Verify payload and signature against Platform of Trust public key.
        for (let i = 0; i < publicKeys.length; i++) {
            if (verified) continue;
            if (rsa.verifySignature(req.body, signature, publicKeys[i].key)) {
                verified = true;
                environment = publicKeys[i].env;
            }
        }

        if (!verified) return done(null, false, {message: 'Signature validation failed'});

        /*
            let user = {
                '@id': extractId(req.headers['x-user-token'])
            };
             */

        const app = {
            '@id': extractId(req.headers['x-app-token']),
        };

        // Attach identity details and additional info.
        return done(null, app, {
            environment,
            scope: '*',
        });
    },
    ));
};
