'use strict';
/**
 * Siemens Mindsphere.
 */

const LIMIT = 7776000000; // 90 days.

/**
 * Limits history query range to 90 days and converts timestamps.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    const query = options.query;
    let start;
    let end;
    if (config.authConfig.url.includes('mindsphere.io')) {
        // Pick start and end times.
        for (let i = 0; i < query.length; i++) {
            if (Object.keys(query[i])[0] === 'from') {
                start = new Date(Object.values(query[i])[0]).getTime();
            }
            if (Object.keys(query[i])[0] === 'to') {
                end = new Date(Object.values(query[i])[0]).getTime();
            }
        }
        /** History query range limiter. */
        if (start && end) {
            if (end - start > LIMIT) {
                // Limit range.
                start = end - LIMIT;
            }
        }
        /** Timestamp conversion. */
        for (let i = 0; i < query.length; i++) {
            if (Object.keys(query[i])[0] === 'from') {
                query[i][Object.keys(query[i])[0]] = new Date(start).toISOString();
            }
            if (Object.keys(query[i])[0] === 'to') {
                query[i][Object.keys(query[i])[0]] = new Date(Object.values(query[i])[0]).toISOString();
            }
        }
    }
    return options;
};

/**
 * Translates response id to request id.
 *
 * @param {Object} config
 * @param {String/Object} id
 * @return {String/Object}
 */
const id = async (config, id) => {
    let translation;
    try {
        translation = config.parameters.ids[config.index];
    } catch (err) {
        return id;
    }
    return translation || id;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'siemens-mindsphere',
    request,
    id,
};
