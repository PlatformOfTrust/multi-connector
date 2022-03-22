'use strict';
/**
 * Module dependencies.
 */
const rp = require('request-promise');

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
                return Promise.resolve({});
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
        const { values: lines, customerId } = response;
        const { start: startTime, end: endTime } = (config.parameters || {});
        const domain = config.authConfig.url;
        const machinesUrl = domain + '/machines';
        const modulesUrl = domain + '/modules';
        const countersUrl = domain + '/counters';
        const productionSpeedUrl = domain + '/production-speed';
        const rundataUrl = domain + '/rundata';
        const productionCounterUrl = domain + '/production-counter';
        const productionOverviewUrl = domain + '/production-overview';
        const shiftOverviewUrl = domain + '/shift-overview';
        const headers = config.authConfig.headers;
        let machines = (await Promise.all((lines || []).map(async (line) => {
            const query = {
                customerId: customerId,
                lineId: line.lineId
            };
            const result = await request('GET', machinesUrl, headers, {}, query);
            return result.body.values || [];
        }))).flat();
        machines = await Promise.all(machines.map(async (machine) => {
            const query = {
                customerId: customerId,
                machineId: machine.machineId
            };
            let { body: { values: modules } = {} } = (await request('GET', modulesUrl, headers, {}, query) || {});
            let { body: { values: counters } = {} } = (await request('GET', countersUrl, headers, {}, query) || {});
            if (startTime && endTime) {
                modules = await Promise.all(modules.map(async (mod) => {
                    const moduleQuery = { ...query, moduleId: mod.moduleId, startTime, endTime }
                    const productionSpeed = await request('GET', productionSpeedUrl, headers, {}, moduleQuery);
                    const rundata = await request('GET', rundataUrl, headers, {}, moduleQuery);
                    return {
                        ...mod,
                        productionSpeed: (productionSpeed.body || {}).values || [],
                        rundata: (rundata.body || {}).values || []
                    };
                }));
                counters = await Promise.all(counters.map(async (counter) => {
                    const productionSpeed = await request('GET', productionCounterUrl, headers, {}, { ...query, counterId: counter.counterId, startTime, endTime });
                    return {
                        ...counter,
                        productionCounter: (productionSpeed.body || {}).values || []
                    };
                }));
            }
            machine.modules = modules || [];
            machine.counters = counters || [];
            const { body: { values: productionOverview } = {} } = (await request('GET', productionOverviewUrl, headers, {}, { ...query, startTime, endTime }) || {});
            machine.productionOverview = productionOverview || [];
            const { body: { values: shiftOverview } = {} } = (await request('GET', shiftOverviewUrl, headers, {}, { ...query, startTime, endTime }) || {});
            machine.shiftOverview = shiftOverview || [];
            return machine;
        }));
        return { ...response, values: machines };
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'orfer_api',
    response
};
