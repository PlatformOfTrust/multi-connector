'use strict';
/**
 * Module dependencies.
 */
const rp = require('request-promise');
const _ = require('lodash');

/**
 * Orfer API.
 */

/**
 * Sends http request.
 *
 * @param {String} method
 * @param {String} url
 * @param {Object} [headers]
 * @param {String/Object/Array} [body]
 * @return {Promise}
 */
function request (method, url, headers, body, query = {}) {
    const options = {
        method: method,
        uri: url,
        qs: query || {},
        json: true,
        body: body,
        resolveWithFullResponse: true,
        headers: headers,
    };

    return rp(options).then(result => Promise.resolve(result))
        .catch((error) => {
            return Promise.resolve(error);
        });
}

/**
 * Splits processes.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        const {values: factories, customerId} = response;
        const {start: startTime, end: endTime} = (config.parameters || {});
        const domain = config.authConfig.url;
        const linesUrl = domain + '/production-lines';
        const machinesUrl = domain + '/machines';
        const modulesUrl = domain + '/modules';
        const countersUrl = domain + '/counters';
        const productionSpeedUrl = domain + '/production-speed';
        const rundataUrl = domain + '/rundata';
        const productionCounterUrl = domain + '/production-counter';
        const productionOverviewUrl = domain + '/production-overview';
        const shiftOverviewUrl = domain + '/shift-overview';
        const errorDataUrl = domain + '/error-data';
        const errorSummaryUrl = domain + '/error-summary';
        const headers = config.authConfig.headers;

        const lines = (await Promise.all((factories || []).map(async factory => await request('GET', linesUrl, headers, {}, {
            customerId: customerId,
            factoryId: factory.factoryId,
        })))).map(res => res.body.values.map(l => ({...l, factory: factories.find(f => f.factoryId === res.body.factoryId)}))).flat();

        let machines = (await Promise.all((lines || []).map(async (line) => {
            const query = {
                customerId: customerId,
                lineId: line.lineId,
            };
            const result = await request('GET', machinesUrl, headers, {}, query);
            return (result.body.values || []).map(o => ({...o, customerId, line}));
        }))).flat();
        const recipes = {};
        machines = await Promise.all(machines.map(async (machine) => {
            const query = {
                customerId: customerId,
                machineId: machine.machineId,
            };
            let {body: {values: modules} = {}} = (await request('GET', modulesUrl, headers, {}, query) || {});
            let {body: {values: counters} = {}} = (await request('GET', countersUrl, headers, {}, query) || {});
            if (startTime && endTime) {
                modules = await Promise.all(modules.map(async (mod) => {
                    const moduleQuery = {...query, moduleId: mod.moduleId, startTime, endTime};
                    const productionSpeed = await request('GET', productionSpeedUrl, headers, {}, moduleQuery);
                    const rundata = await request('GET', rundataUrl, headers, {}, moduleQuery);
                    try {
                        const includedRundataKeys = ['uptime', 'effective', 'downtime', 'notInUse'];
                        ((rundata.body || {}).values || []).forEach((recipe => {
                            Object.entries(recipe).forEach(([key, value]) => {
                                if (includedRundataKeys.includes(key)) {
                                    recipes[recipe.recipeName] = {...(recipes[recipe.recipeName] || {}), recipeName: recipe.recipeName};
                                    recipes[recipe.recipeName] = {...(recipes[recipe.recipeName] || {}), [key]: (recipes[recipe.recipeName] ? recipes[recipe.recipeName][key] || 0 : 0) + value};
                                }
                            });
                        }));
                    } catch (err) {
                        console.log(err.message);
                    }
                    return {
                        ...mod,
                        productionSpeed: (productionSpeed.body || {}).values || [],
                        rundata: (rundata.body || {}).values || [],
                    };
                }));
                counters = await Promise.all(counters.map(async (counter) => {
                    const productionSpeed = await request('GET', productionCounterUrl, headers, {}, {...query, counterId: counter.counterId, startTime, endTime});
                    try {
                        const includedProductionCounterKeys = ['produced', 'defect'];
                        ((productionSpeed.body || {}).values || []).forEach((recipe => {
                            Object.entries(recipe).forEach(([key, value]) => {
                                if (includedProductionCounterKeys.includes(key)) {
                                    recipes[recipe.recipeName] = {...(recipes[recipe.recipeName] || {}), recipeName: recipe.recipeName};
                                    recipes[recipe.recipeName] = {...(recipes[recipe.recipeName] || {}), [key]: (recipes[recipe.recipeName] ? recipes[recipe.recipeName][key] || 0 : 0) + value};
                                }
                            });
                        }));

                    } catch (err) {
                        console.log(err.message);
                    }
                    return {
                        ...counter,
                        productionCounter: (productionSpeed.body || {}).values || [],
                    };
                }));
            }
            machine.modules = modules || [];
            machine.counters = counters || [];

            const values = {};
            const {body: {values: productionOverview} = {}} = (await request('GET', productionOverviewUrl, headers, {}, {...query, startTime, endTime}) || {});
            (productionOverview || []).sort((a, b) => a['recipeName'] - b['recipeName']).forEach(o => Object.entries(o).forEach(([key, value]) => {
                values[key] = key === 'recipeName' ? ((values[key] || '') + (values[key] ? ', ' : '') + value) : (values[key] || 0) + value;
            }));

            try {
                // Detect if effective is calculated wrongly.
                if (values.effective === 0 && Object.values(recipes).map(r => r.effective || 0).reduce((a, b) => a + b, 0) !== 0) {
                    values.effective = Object.values(recipes).map(r => r.effective || 0).reduce((a, b) => a + b, 0);
                }
            } catch (err) {
                console.log(err.message);
            }

            // Merge objects into one.
            machine.productionOverview = (productionOverview || []).length > 0 && Object.keys(values).length > 0 ? {
                startTime,
                endTime,
                ...values,
            } : undefined;

            const {body: {values: shiftOverview} = {}} = (await request('GET', shiftOverviewUrl, headers, {}, {...query, startTime, endTime}) || {});
            machine.shiftOverview = shiftOverview || [];

            const {body: {values: errorData} = {}} = (await request('GET', errorDataUrl, headers, {}, {...query, startTime, endTime}) || {});
            machine.errorData = errorData || [];

            const {body: {values: errorSummary} = {}} = (await request('GET', errorSummaryUrl, headers, {}, {...query, startTime, endTime}) || {});
            machine.errorSummary = errorSummary || [];

            return machine;
        }));
        return {...response, values: machines};
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'orfer-api',
    response,
};
