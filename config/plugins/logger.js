'use strict';
/**
 * logger plugin.
 *
 * Handy tool to debug the connector. Add to template plugins array and everything will be logged.
 */
const logger = function (method, config, param) {
    console.log('\n<--- ' + method +' --->');
    console.log(param);
    return param;
};
/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'logger',
    template: (config, param) => logger('TEMPLATE', config, param),
    parameters: (config, param) => logger('PARAMETERS', config, param),
    request: (config, param) => logger('REQUEST', config, param),
    onerror: (config, param) => logger('ONERROR', config, param.message),
    response: (config, param) => logger('RESPONSE', config, param),
    data: (config, param) => logger('DATA', config, param),
    id: (config, param) => logger('ID', config, param),
    output: (config, param) => logger('OUTPUT', config, param),
};