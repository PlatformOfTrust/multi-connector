'use strict';
/**
 * Module dependencies.
 */
const cache = require('../../app/cache');

/**
 * Dynamic mode changer.
 */

/**
 * Sets mode as a static config value.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        const template = cache.getDoc('templates', config.template);
        const options = template.generalConfig['mode'] || {};
        config.static.mode = 'latest';
        if (parameters.start && parameters.end) {
            if (new Date(parameters.end).getTime() > new Date().getTime()) {
                config.static.mode = options['prediction'] || 'prediction';
            } else {
                config.static.mode = options['history'] || 'history';
            }
        } else {
            config.static.mode = options['latest'] || 'latest';
        }
    } catch (err) {
        console.log(err.message);
    }
    return parameters;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'mode',
    parameters,
};
