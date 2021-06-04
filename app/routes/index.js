'use strict';
/**
 * Module dependencies.
 */
const cors = require('cors');

/**
 * Root routes.
 */
module.exports.app = function (app, passport) {
    /** Include before other routes. */
    app.options('*', cors());

    /** Translator endpoints. */
    app.use('/translator/', require('./translator/index')(passport));
    app.use('/connector/', require('./translator/index')(passport));

    /** Default endpoint. */
    app.use('', function (req, res) {
        return res.json({
            message: 'Hello there!',
        });
    });
};
