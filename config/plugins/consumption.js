'use strict';
/**
 * Consumption plugin.
 */

/**
 * Finds start and end values.
 *
 * @param {Array} items
 * @return {Object}
 */
function findStartEnd (items) {
    const result = {start: items[0], end: items[0]};
    items.forEach(function (value) {
        result.start = value.timestamp < result.start.timestamp ? value : result.start;
        result.end = value.timestamp > result.end.timestamp ? value : result.end;
    });
    return {start: result.start.value, end: result.end.value};
}
/**
 * Calculates start, end and consumption values.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    try {
        if ((config.schema || '').includes('measure-water-meter-reading')) {
            output.data.sensors = output.data.sensors.map(sensor => {
                const {start, end} = findStartEnd(sensor.measurements);
                const value = end - start;
                sensor.measurements = [{
                    ...sensor.measurements[0],
                    start,
                    end,
                    value,
                }];
                return sensor;
            });
        }
        return output;
    } catch (e) {
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'consumption',
    output,
};
