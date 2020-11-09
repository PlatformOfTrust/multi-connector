'use strict';
/**
 * Siemens Navigator.
 */

/**
 * Converts timestamps.
 *
 * @param {Object} config
 * @param {Object} options
 * @return {Object}
 */
const request = async (config, options) => {
    const query = options.query;
    if (config.authConfig.url.includes('eadvantage.siemens.com')) {
        /** Timestamp conversion. */
        for (let i = 0; i < query.length; i++) {
            if (Object.keys(query[i])[0] === 'utcStartTimestamp'
                || Object.keys(query[i])[0] === 'utcEndTimestamp') {
                query[i][Object.keys(query[i])[0]] = (new Date(Object.values(query[i])[0])
                    .toLocaleString('en-US')).replace(',', '');
            }
        }
    }
    return options;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'siemens-navigator',
    request,
};
