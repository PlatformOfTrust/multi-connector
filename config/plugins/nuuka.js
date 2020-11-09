'use strict';

/**
 * Nuuka Open API.
 */

/**
 * Formats date to YYYY-MM-DD.
 *
 * @param {Date} date
 * @return {String}
 */
function formatDate (date) {
    let d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}

/**
 * Manipulates request parameters.
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    try {
        if (Object.hasOwnProperty.call(parameters, 'ids')) {
            if (Array.isArray(parameters.ids)) {
                for (let i = 0; i < parameters.ids.length; i++) {
                    parameters.ids[i] = encodeURIComponent(parameters.ids[i]);
                }
            }
        }
        return parameters;
    } catch (e) {
        return parameters;
    }
};

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
            if (Object.keys(query[i])[0] === 'StartTime'
                || Object.keys(query[i])[0] === 'EndTime') {
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
    name: 'nuuka',
    parameters,
    request,
};
