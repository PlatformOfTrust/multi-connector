'use strict';
/**
 * Airwits data decoder.
 *
 */

/**
 * Decodes data.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    const output = {};
    try {
        output.device = response.device;
        output.time = response.time * 1000;
        output.header = response.data.substring(0, 2);
        output.temp = parseInt(response.data.substring(2, 6), 16) / 10 - 40;
        output.humidity = parseInt(response.data.substring(6, 8), 16);
        return output;
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'airwits',
    response,
};
