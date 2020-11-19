'use strict';

/**
 * VTT-IDS.
 */

/**
 * Formats date to YYYY-MM-DD.
 *
 * @param {Date} date
 * @return {String}
 */
function formatDate (date) {
    return date.slice(0, 19);
}

/**
 * Converts timestamps.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    try {
        const query = options.query;
        /** Timestamp conversion. */
        for (let i = 0; i < query.length; i++) {
            if (Object.keys(query[i])[0] === 'start'
                || Object.keys(query[i])[0] === 'stop') {
                query[i][Object.keys(query[i])[0]] = formatDate(Object.values(query[i])[0]);
            }
        }
    } catch (err) {
        return options;
    }
    return options;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'vtt-ids',
    request,
};
