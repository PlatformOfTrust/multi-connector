'use strict';
/**
 * Module dependencies.
 */
const ctrl = require('../../../../controllers/hooks');

/**
 * Hook routes.
 */
module.exports = function (passport) {
    /** Dynamic router. */
    return ctrl.hooks(passport);
};
