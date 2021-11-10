'use strict';

/**
 * Converts timestamps.
 *
 * @param {Object} config
 * @param {Object} data
 * @return {Object}
 */
const data = async (config, data) => {
    try {
        /** Plugin test. */
        const newReadings = data.MeasureWaterConsumption.readings.map(reading => ({ ...reading, date: `${reading.date} test123` }));
        return newReadings;
    } catch (err) {
        return data;
    }
};


/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'vertolive',
    data,
};
