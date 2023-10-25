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

        try {
            // Validate consumption value by comparing it to a value based on average consumption between time intervals.
            const interval = new Date(item.data[item.data.length - 1].timestamp).getTime() -  new Date(item.data[0].timestamp).getTime();
            const value = Number.parseFloat(item.data[item.data.length - 1].value) - Number.parseFloat(item.data[0].value);
            const timeIntervals = [];
            const valueIntervals = [];
            item.data.reduce((previous, current) => {
                if (previous) {
                    const difference = Number.parseFloat(current.value) - Number.parseFloat(previous.value);
                    if (difference > 0) {
                        valueIntervals.push(difference);
                        timeIntervals.push(new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime());
                    } else {
                        return previous;
                    }
                }
                return current;
            });
            const averageTime = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
            const averageValue = valueIntervals.reduce((a, b) => a + b, 0) / valueIntervals.length;
            if (result[type].value > 10 * averageValue / averageTime * interval && value > 0) {
                result[type].value = value;
            }

            // Adjust end value.
            if (result[type].endValue === 0) {
                result[type].endValue = Number.parseFloat((result[type].data.filter(item => Number.parseFloat(item.value) !== 0).pop() || {value: '0'}).value);
            }
        } catch (err) {
            console.log('Failed to validate consumption.');
        }
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
