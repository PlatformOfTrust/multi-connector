'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Fidelix request compose and response parsing.
 */

/**
 * Composes request arguments.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {

    /** Test parameters. */

    // template.authConfig.function = 'Fidelix.FidelixSoap.getPointData';

    // template.mode = 'history';
    // template.authConfig.path = {'groupId': 'PoTTest', start: '04.05.2021', end: '05.05.2021'};

    if (template.mode === 'history') {
        template.authConfig.function = 'Fidelix.FidelixSoap.GetHistoryValuesForGroup';
        // TODO: Compose history query arguments.
    } else {
        if (template.authConfig.function.includes('getPointDataList')) {
            template.authConfig.path = {'point_ids': template.authConfig.path.map(o => o.point_id).map((id) => {return {string: id};})};
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
                        result.push(...data);
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
 * Expose plugin methods.
 */
module.exports = {
    name: 'fidelix',
    template,
    response,
};
