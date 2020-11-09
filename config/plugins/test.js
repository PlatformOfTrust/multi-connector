'use strict';
/**
 * Test plugin.
 */

/**
 * Generates random value.
 *
 * @param {Number} min
 * @param {Number} max
 * @param {Number} decimalPlaces
 * @return {Number}
 */
const genRand = function (min, max, decimalPlaces) {
    const rand = Math.random() * (max - min) + min;
    const power = Math.pow(10, decimalPlaces);
    return Math.floor(rand * power) / power;
};

/**
 * Generates test data by id and time range.
 *
 * @param {String} id
 * @param {Array} range
 * @return {Array}
 */
const generateData = function (id, range) {
    const entry = {
        value: genRand(19, 26, 2),
        name: 'Sensor ' + id,
        id,
    };
    if (range) {
        const data = [];
        let length = 1;
        if (range[0].toString() !== 'Invalid Date'
            && range[1].toString() !== 'Invalid Date') {
            length = Math.max(Math.floor((range[1].getTime() - range[0].getTime()) / 600000), 1);
        } else {
            range[0] = new Date.now();
        }
        for (let i = 0; i < length; i++) {
            data[i] = {
                timestamp: range[0].getTime() + i * 600000,
                value: genRand(19, 26, 2),
                name: 'Sensor ' + id,
                id,
            };
        }
        return data;
    } else {
        return [entry];
    }
};

/**
 * Generates test data by given attributes.
 *
 * @param {Object} config
 * @param {Object/String} res
 * @return {Object}
 */
const response = async (config, res) => {
    let response;

    /** Data fetching. */
    try {
        let range;
        if (config.mode === 'history' || config.mode === 'prediction') {
            range = [config.parameters.start, config.parameters.end];
        }

        // Generate data.
        response = generateData(res, range);
    } catch (err) {
        console.log(err.message);
    }
    return response;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'test',
    response,
};
