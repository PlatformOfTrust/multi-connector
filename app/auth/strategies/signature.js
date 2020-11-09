'use strict';
/**
 * Module dependencies.
 */
const util = require('util');
const Strategy = require('passport-strategy');

/**
 * Creates an instance of `Strategy`.
 *
 * The Signature authentication strategy authenticates requests based on
 * a signature contained in the request header 'x-pot-signature'
 *
 * Applications must supply a `verify` callback, for which the function
 * signature is:
 *
 *     function(signature, done) { ... }
 *
 * `signature` is provided to verify the authenticity of the payload. The verify callback
 * is responsible for verifying the signature, and invoking
 * `done` with the following arguments:
 *
 *     done(err, signature, info);
 *
 * If the signature fails verification, `signature` should be set to `false` to indicate an
 * authentication failure. Additional signature `info` can optionally be passed as
 * a third argument, which will be set by Passport at `req.authInfo`, where it
 * can be used by later middleware for access control. This is typically used
 * to pass any scope associated with the signature.
 *
 * Examples:
 *
 *     passport.use(new SignatureStrategy(
 *       function(signature, done) {
 *         if (!verifySignature(signature)) return done(null, false);
 *         return done(null, signature);
 *       }
 *     ));
 *
 * @constructor
 * @param {Object} [options]
 * @param {Function} verify
 * @api public
 */

function SignatureStrategy (options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('Signature strategy requires a verify callback');

    this._signatureField = options.signatureField || 'x-pot-signature';

    Strategy.call(this);
    this.name = 'signature';
    this._verify = verify;
    this._passReqToCallback = options.passReqToCallback;
}

util.inherits(SignatureStrategy, Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
SignatureStrategy.prototype.authenticate = function (req, options) {
    options = options || {};
    // Looking for this._signatureField inside both request queries and request bodies.
    const signature = lookup(req.headers, this._signatureField);
    if (!signature) {
        return this.fail(new Error('Missing signature'));
    }

    const self = this;

    function verified (err, user, info) {
        if (err) {
            return self.error(err);
        }
        if (!user) {
            return self.fail(info);
        }
        self.success(user, info);
    }

    if (self._passReqToCallback) {
        this._verify(req, signature, verified);
    } else {
        this._verify(signature, verified);
    }

    function lookup (obj, field) {
        if (!obj) {
            return null;
        }
        const chain = field.split(']').join('').split('[');
        for (let i = 0, len = chain.length; i < len; i++) {
            const prop = obj[chain[i]];
            if (typeof (prop) === 'undefined') {
                return null;
            }
            if (typeof (prop) !== 'object') {
                return prop;
            }
            obj = prop;
        }
        return null;
    }
};

/**
 * Expose `SignatureStrategy` constructor.
 */
module.exports.SignatureStrategy = SignatureStrategy;
