'use strict';
/**
 * Data Convert.
 */

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        // Convert data array.
        if (Object.hasOwnProperty.call(response, 'data')) {
            if (Array.isArray(response.data)) {
                const input = response.data;
                const output = [];
                for (let i = 0; i < input.length; i++) {
                    output.push({[input[i].quality]: input[i].value});
                }
                response.data = output;
            }
        }
    } catch (err) {
        console.log(err.message);
    }
    return response;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'data-convert',
    response,
};
