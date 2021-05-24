'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Fidelix request compose and response parsing.
 */

/**
 * Convert date object to date string.
 *
 * @param {Date} datetime
 * @param {Date} [fallback]
 * @return {String}
 */
const getDate = (datetime, fallback = new Date()) => {
    let input = new Date();
    if (Object.prototype.toString.call(datetime) === '[object Date]') {
        input = datetime;
    } else if (Object.prototype.toString.call(fallback) === '[object Date]') {
        input = fallback;
    }
    const date = input.getUTCDate();
    const month = input.getUTCMonth() + 1; // Since getUTCMonth() returns month from 0-11 not 1-12.
    const year = input.getUTCFullYear();
    return date + '.' + month + '.' + year;
};

/**
 * Composes request arguments.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    const groupIds = [];
    try {
        // Pick group ids.
        groupIds.push(..._.uniq(template.parameters.ids.filter(id => Object.hasOwnProperty.call(id, 'groupId')).map(id => id.groupId)));
    } catch (e) {
        console.log(e.message);
    }

    if (template.mode === 'history' && groupIds.length > 0) {
        template.authConfig.function = 'Fidelix.FidelixSoap.GetHistoryValuesForGroup';

        // Convert start and end date times, set fallback as -24h to start.
        const start = getDate(template.parameters.start, new Date(new Date().getTime() - 24 * 60 * 60 * 1000));
        const end = getDate(template.parameters.end, new Date());

        // Query by groupIds and filter output by point ids.
        template.authConfig.path = groupIds.map(id => { return {'groupId': id, start, end};});
    } else {
        if (template.authConfig.function.includes('getPointDataList')) {
            template.authConfig.path = {'point_ids': template.authConfig.path.map((id) => {return {string: id};})};
        }
    }
    return template;
};

/**
 * Parses response data.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    if (!_.isObject(response)) {
        return response;
    }
    let result = [];

    // 1. One value per request (latest).
    const single = 'getPointDataResult';

    // 2. Multiple values per request (latest).
    const array = 'getPointDataListResult';
    const dataObject = 'PointData';
    const valueKey = 'getPointDataResult';

    // 3. History.
    const history = 'GetHistoryValuesForGroupResult';
    const historyObject = 'HistoryDataList';
    const historyArray = 'HistoryData';

    try {
        if (Object.hasOwnProperty.call(response, array)) {
            /** 1. */
            if (Object.hasOwnProperty.call(response[array], 'PointData')) {
                if (Array.isArray(response[array][dataObject])) {
                    for (let i = 0; i < response[array][dataObject].length; i++) {
                        if (Object.hasOwnProperty.call(response[array][dataObject][i], 'Id')) {
                            const data = {
                                hardwareId: response[array][dataObject][i]['Id'],
                                [valueKey]: response[array][dataObject][i]['Value'],
                            };
                            result.push(data);
                        }
                    }
                }
            }
        } else if (Object.hasOwnProperty.call(response, single)) {
            /** 2. */
            const data = {
                [single]: response['getPointDataResult'],
                hardwareId: response.hardwareId['point_id'],
            };
            result.push(data);
        } else if (Object.hasOwnProperty.call(response, history)) {
            /** 3. */
            if (Object.hasOwnProperty.call(response[history], historyObject)) {
                if (Object.hasOwnProperty.call(response[history][historyObject], historyArray)) {
                    response[history][historyObject][historyArray].map(entry => {
                        const data = entry['Values']['HistoryTimeValuePair'].map(measurement => {
                            return {
                                hardwareId: entry['PointId'],
                                [single]: measurement['Value'],
                                timestamp: measurement['Time'],
                            };
                        });
                        // Obey given start and end date times.
                        try {
                            const start = config.parameters.start;
                            const end = config.parameters.end;
                            const cut = data.filter(m => m.timestamp >= start && m.timestamp <= end);
                            result.push(...cut);
                        } catch (e) {
                            result.push(...data);
                        }
                    });
                }
            }
        } else {
            result = response;
        }
        return result;
    } catch (e) {
        return result;
    }
};

/**
 * Filters data by point ids.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    const ids = [];
    try {
        ids.push(...config.parameters.ids.map(entry => entry.id).flat());
        output[config.output.object][config.output.array] = output[config.output.object][config.output.array].filter(d => ids.includes(d[config.output.id]));
        return output;
    } catch (err) {
        return output;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'fidelix',
    template,
    response,
    output,
};
