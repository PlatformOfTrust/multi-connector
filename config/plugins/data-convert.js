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
        const output = Array.isArray(response) ? response : [response];
        // Convert data array.
        for (let i = 0; i < output.length; i++) {
            if (Object.hasOwnProperty.call(output[i], 'data')) {
                if (Array.isArray(output[i].data)) {
                    const input = output[i].data;
                    const data = {};
                    for (let j = 0; j < input.length; j++) {
                        data[input[j].quality] = input[j].value;
                    }
                    output[i].data = data;
                }
            }
        }
        response = output;
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
