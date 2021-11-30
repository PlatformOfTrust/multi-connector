'use strict';
/**
 * Repeater transformer.
 */

/**
 * Removes encapsulation from response.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    try {
        return Object.values(output.data)[0][0][config.output.data][0][config.output.value];
    } catch (err) {
        console.log(err.message);
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'repeater',
    output,
};
