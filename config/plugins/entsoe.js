'use strict';
/**
 * Module dependencies.
 */
const parser = require('fast-xml-parser');
const _ = require('lodash');

/**
 * Entsoe response parsing and output transforming.
 */

/**
 * Funktio, joka lisää tunnin päivämäärään nätisti.
 *
 * @param {Date} time
 * @param {Number} h
 * @return {Date}
 */
function addHours (time, h) {
    time.setTime(time.getTime() + (h * 60 * 60 * 1000));
    return time;
}

/**
 * Convert ISO string to date.
 *
 * @param {String} ISOString
 * @return {String}
 */
const getDate = (ISOString) => {
    let date;
    try {
        date = ISOString.split('T')[0];
        date = date.replace(/-/g, '.');
        date = date.split('.')[2] + '.' + date.split('.')[1] + '.' + date.split('.')[0];
    } catch (e) {
        return ISOString;
    }
    return date;
};

/**
 * If parameter period first date is bigger than second, change their place without getting error
 *
 * @param {Object} config
 * @param {Object} parameters
 * @return {Object}
 */
const parameters = async (config, parameters) => {
    let time = parameters.period;
    time = time.split('/');
    const startTime = Date.parse(time[0]);
    const endTime = Date.parse(time[1]);
    if (startTime > endTime) {
        parameters.period = time[1].concat('/', time[0]);
    }
    return parameters;
};

/**
 * Removes dots from xml response < > tags.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        response = parser.parse(response.body.toString().replace(/\.(?=[^<>]*>)/g, ''));
        return response;
    } catch (e) {
        return response;
    }
};

/**
 * Transforms output to Platform of Trust context schema.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    try {
        output.data.forecasts = output.data.forecasts.map((f) => {
            let start;
            let end;
            const forecast = {['@type']: 'ForecastElectricityPriceMWH', period: '', ...f};
            forecast.pricePlans = _.flatten(f.pricePlans.map((plan) => {
                let series = [];
                if (Array.isArray(plan.rate.TimeSeries)) {
                    series = plan.rate.TimeSeries;
                } else {
                    series = [plan.rate.TimeSeries];
                }
                return _.flatten(series.map(s => s.Period.Point.map((p) => {
                    // Compare single plan period against output period.
                    if (!start) {
                        start = new Date(plan.rate.periodtimeInterval.start);
                    } else if (new Date(plan.rate.periodtimeInterval.start).getTime() < start.getTime()) {
                        start = new Date(plan.rate.periodtimeInterval.start);
                    }
                    if (!end) {
                        end = new Date(plan.rate.periodtimeInterval.end);
                    } else if (new Date(plan.rate.periodtimeInterval.end).getTime() > end.getTime()) {
                        end = new Date(plan.rate.periodtimeInterval.end);
                    }

                    // Format plan period.
                    let periodStart = addHours(new Date(s.Period.timeInterval.start), p.position - 1);
                    periodStart = getDate(periodStart.toISOString())
                        + 'T'
                        + periodStart.toISOString().split('T')[1].split(':')[0]
                        + ':00';

                    return {
                        '@type': 'PricePlan',
                        currency: s.currency_Unitname,
                        period: periodStart + '/1h',
                        rate: p.priceamount,
                    };
                })));
            }));

            // Comment, if id field is required to be included.
            delete forecast.id;

            // Format output period.
            forecast.period = getDate(start.toISOString()) + '/' + getDate(end.toISOString());
            return forecast;
        });
        return output;
    } catch (e) {
        return output;
    }
};
/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'entsoe',
    response,
    parameters,
    output,
};
