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
    const result = {};
    // Group by type.
    items.forEach(item => {
        const type = item['@type'] || 'N/A';
        if (!Object.hasOwnProperty.call(result, type)) {
            result[type] = {...item, data: [], startValue: item.value, endValue: item.value};
        }
        result[type].data.push(item);
        result[type].data.sort((x, y) => new Date(x.timestamp).getTime() - new Date(y.timestamp).getTime());
        if (new Date(item.timestamp).getTime() < new Date(result[type].start).getTime() || result[type].start === undefined) {
            result[type].startValue = Number.parseFloat(item.value);
            result[type].start = item.timestamp;
        }
        if (new Date(item.timestamp).getTime() > new Date(result[type].end).getTime() || result[type].end === undefined) {
            result[type].endValue = Number.parseFloat(item.value);
            result[type].end = item.timestamp;
        }
    });
    // Calculate consumption.
    Object.entries(result).forEach(([type, item]) => {
        const peaks = [0];
        let index = 0;
        for (let i = 0; i < item.data.length; i++) {
            if (Number.parseFloat(item.data[i].value) >= peaks[index]) {
                peaks[index] = Number.parseFloat(item.data[i].value);
            } else {
                index++;
                peaks[index] = Number.parseFloat(item.data[i].value);
            }
        }
        result[type].value = peaks.reduce((a, c) => a + c);
        result[type].value -= result[type].startValue;
    });
    return Object.values(result);
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
            output.data.process = (output.data.process || output.data.sensors).map(sensor => {
                sensor.measurements = findStartEnd(sensor.measurements);
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
