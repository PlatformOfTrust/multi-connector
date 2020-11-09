'use strict';
/**
 * IoT-Ticket path parameter encoding.
 */

/**
 * Checks if variable is object.
 *
 * @param {Object} a
 * @return {Boolean}
 */
const isObject = function (a) {
    return (!!a) && (a.constructor === Object);
};

/**
 * Manipulates request parameters.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'ids')) {
            if (Array.isArray(parameters.ids)) {
                for (let i = 0; i < parameters.ids.length; i++) {
                    if (isObject(parameters.ids[i])) {
                        if (Object.hasOwnProperty.call(parameters.ids[i], 'path')) {
                            parameters.ids[i].path = encodeURI(parameters.ids[i].path);
                        }
                    }
                }
            }
        }
        return parameters;
    } catch (err) {
        return parameters;
    }
};

/**
 * Translates response id to request id.
 *
 * @param {Object} config
 * @param {String/Object} id
 * @return {String/Object}
 */
const id = async (config, id) => {
    let translation;
    try {
        translation = config.parameters.ids.find(reqId => reqId.path.includes(id.toLowerCase()));
    } catch (err) {
        return id;
    }
    return translation || id;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'iot-ticket',
    parameters,
    id,
};
