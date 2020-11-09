'use strict';
/**
 * Module dependencies.
 */
const ctrl = require('../../../../controllers/plugins');

/**
 * Plugins routes.
 */
module.exports = function (passport) {
    /** Dynamic router. */
    return ctrl.plugins(passport);
};
