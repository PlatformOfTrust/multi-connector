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
 * @param {Object} [query]
 * @param {String/Object/Array} [returnOnError]
 * @return {Promise}
 */
function request (method, url, headers, body, query = {}, returnOnError) {
    const options = {
        method,
        uri: url,
        qs: query || {},
        json: true,
        body,
        resolveWithFullResponse: true,
        headers,
    };

    return rp(options).then(result => {
        return Promise.resolve(result);
    }).catch((error) => {
        return returnOnError ? Promise.resolve(returnOnError) : Promise.resolve(error);
    });
}

const getUrls = domain => ({
    linesUrl: `${domain}/production-lines`,
    machinesUrl: `${domain}/machines`,
    modulesUrl: `${domain}/modules`,
    countersUrl: `${domain}/counters`,
    productionSpeedUrl: `${domain}/production-speed`,
    rundataUrl: `${domain}/rundata`,
    productionCounterUrl: `${domain}/production-counter`,
    productionOverviewUrl: `${domain}/production-overview`,
    shiftOverviewUrl: `${domain}/shift-overview`,
    errorDataUrl: `${domain}/error-data`,
    errorSummaryUrl: `${domain}/error-summary`,
});

const getProductionSpeedAndRundataByModule = async (urls, headers, customerId, module, startTime, endTime, recipes) => {
    const query = {
        customerId: customerId,
        machineId: module.machine.machineId,
    };
    const moduleQuery = {...query, moduleId: module.moduleId, startTime, endTime};

    const result = {};
    const promises = [
        startTime && endTime ? request('GET', urls.productionSpeedUrl, headers, {}, moduleQuery, {body: {values: []}}).then(res => result.productionSpeed = (res.body || {}).values || []) : result.productionSpeed = [],
        startTime && endTime ? request('GET', urls.rundataUrl, headers, {}, moduleQuery, {body: {values: []}}).then(res => result.rundata = (res.body || {}).values || []) : result.rundata = [],
    ];
    await Promise.all(promises);

    try {
        const includedRundataKeys = ['uptime', 'effective', 'downtime', 'notInUse'];
        result.rundata.forEach((recipe => {
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

    return {...module, machine: undefined, customerId: undefined, ...result};
};

const getProductionCounterByCounter = async (urls, headers, customerId, counter, startTime, endTime, recipes) => {
    const query = {
        customerId: customerId,
        machineId: counter.machine.machineId,
    };
    const moduleQuery = {...query, counterId: counter.counterId, startTime, endTime};

    const result = {};
    if (startTime && endTime) {
        await request('GET', urls.productionCounterUrl, headers, {}, moduleQuery, {body: {values: []}}).then(res => result.productionCounter = (res.body || {}).values || []);
    } else {
        result.productionCounter = [];
    }

    try {
        const includedProductionCounterKeys = ['produced', 'defect'];
        result.productionCounter.forEach((recipe => {
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

    return {...counter, machine: undefined, customerId: undefined, ...result};
};

const getModulesByMachine = async (urls, headers, customerId, machine, startTime, endTime, recipes) => {
    const query = {
        customerId: customerId,
        machineId: machine.machineId,
    };
    const result = await request('GET', urls.modulesUrl, headers, {}, query, {body: {values: []}});
    return Promise.all((result.body.values || []).map(async module => await getProductionSpeedAndRundataByModule(urls, headers, customerId, {...module, machine}, startTime, endTime, recipes)));
};

const getCountersByMachine = async (urls, headers, customerId, machine, startTime, endTime, recipes) => {
    const query = {
        customerId: customerId,
        machineId: machine.machineId,
    };
    const result = await request('GET', urls.countersUrl, headers, {}, query, {body: {values: []}});
    return Promise.all((result.body.values || []).map(async counter => await getProductionCounterByCounter(urls, headers, customerId, {...counter, machine}, startTime, endTime, recipes)));
};

const getProductionOverviewByMachine = async (urls, headers, customerId, machine, startTime, endTime, recipes) => {
    const query = {
        customerId: customerId,
        machineId: machine.machineId,
        startTime,
        endTime,
    };
    const result = await request('GET', urls.productionOverviewUrl, headers, {}, query, {body: {values: []}});
    const values = {};
    const productionOverview = (result.body || {}).values || [];
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
    return (productionOverview || []).length > 0 && Object.keys(values).length > 0 ? {
        startTime,
        endTime,
        ...values,
    } : undefined;
};

const getShiftOverviewByMachine = async (urls, headers, customerId, machine, startTime, endTime) => {
    const query = {
        customerId: customerId,
        machineId: machine.machineId,
        startTime,
        endTime,
    };
    const result = await request('GET', urls.shiftOverviewUrl, headers, {}, query, {body: {values: []}});
    return result.body.values || [];
};

const getErrorDataUrlByMachine = async (urls, headers, customerId, machine, startTime, endTime) => {
    const query = {
        customerId: customerId,
        machineId: machine.machineId,
        startTime,
        endTime,
    };
    const result = await request('GET', urls.errorDataUrl, headers, {}, query, {body: {values: []}});
    return result.body.values || [];
};

const getErrorSummaryByMachine = async (urls, headers, customerId, machine, startTime, endTime) => {
    const query = {
        customerId: customerId,
        machineId: machine.machineId,
        startTime,
        endTime,
    };
    const result = await request('GET', urls.errorSummaryUrl, headers, {}, query, {body: {values: []}});
    return result.body.values || [];
};

const getMachineData = async (urls, headers, customerId, machine, startTime, endTime, recipes) => {
    const result = {};
    await Promise.all([
        getModulesByMachine(urls, headers, customerId, machine, startTime, endTime, recipes).then(modules => result.modules = modules),
        getCountersByMachine(urls, headers, customerId, machine, startTime, endTime, recipes).then(counters => result.counters = counters),
        startTime && endTime ? getShiftOverviewByMachine(urls, headers, customerId, machine, startTime, endTime).then(shiftOverview => result.shiftOverview = shiftOverview) : () => result.shiftOverview = [],
        startTime && endTime ? getErrorDataUrlByMachine(urls, headers, customerId, machine, startTime, endTime).then(errorData => result.errorData = errorData) : () => result.errorData = [],
        startTime && endTime ? getErrorSummaryByMachine(urls, headers, customerId, machine, startTime, endTime).then(errorSummary => result.errorSummary = errorSummary) : () => result.errorSummary = [],
    ]);

    // Execute separately to make sure recipes have been set.
    await getProductionOverviewByMachine(urls, headers, customerId, machine, startTime, endTime, recipes).then(productionOverview => result.productionOverview = productionOverview);

    return {...machine, customerId, ...result};
};

const getMachinesByLine = async (urls, headers, customerId, line, startTime, endTime, recipes) => {
    const query = {
        customerId: customerId,
        lineId: line.lineId,
    };
    const result = await request('GET', urls.machinesUrl, headers, {}, query);
    return Promise.all((result.body.values || []).map(async o => await getMachineData(urls, headers, customerId, {...o, customerId, line}, startTime, endTime, recipes)));
};

const getMachinesByFactory = async (urls, headers, customerId, factory, startTime, endTime) => {
    const result = await request('GET', urls.linesUrl, headers, {}, {
        customerId: customerId,
        factoryId: factory.factoryId,
    });
    const recipes = {};
    return Promise.all((result.body.values || []).map(async l => await getMachinesByLine(urls, headers, customerId, {...l, factory}, startTime, endTime, recipes)));
};

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
        const headers = config.authConfig.headers;
        const urls = getUrls(domain);

        const machines = (await Promise.all((factories || []).map(async factory => (await getMachinesByFactory(urls, headers, customerId, factory, config.parameters.defaultStart ? undefined : startTime, endTime))))).flat(2);
        return {values: machines};
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
