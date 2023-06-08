'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const cache = require('../../app/cache');
const winston = require('../../logger.js');
const fetch = require('../../app/lib/request');

/**
 * Kone movement data plugin.
 */

/**
 * Check for matching query ids within deck data.
 *
 * @param {Array} array
 * @param {Array} ids
 * @return {Object}
 */
const hasMatchingIds = (array, ids) => array
    .filter(d => ids.includes(d.startFloor.floorIndex) || ids.includes(d.stopFloor.floorIndex))
    .length > 0;

/**
 * Picks query ids within deck data.
 *
 * @param {Array} array
 * @return {Object}
 */
const pickQueryIds = (array) => array
    .map(d => [(d.startFloor || {}).floorIndex || null, (d.stopFloor || {}).floorIndex || null])
    .flat().filter(id => id !== null);

/**
 * Removes old data from cache.
 *
 * @param {String} productCode
 * @return {Object}
 */
const latestData = (productCode) => {
    // Clear old data from cache.
    const data = cache.getDoc('messages', productCode) || {};
    const queryIds = _.uniq(Object.entries(data).map(([_key, value]) => pickQueryIds((value.data || {}).decks || [])).flat());
    const latestData = Object.fromEntries(queryIds.map(id => {
        return Object.values(Object.entries(data).filter(([_key, value]) => {
            try {
                return hasMatchingIds((value.data || {}).decks || [], [id]);
            } catch (err) {
                winston.log('error', `500 | kone-elevator-movement | ${productCode ? `productCode=${productCode} | ` : ''}${err.message}`);
            }
            return false;
        })).sort((a, b) => new Date(a.time) - new Date(b.time))[0];
    }));
    cache.setDoc('messages', productCode, latestData);
    return latestData;
};

/**
 * Switch querying to Data Storage.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        // Convert ids.
        const ids = (_.get(template, 'parameters.ids') || []).map(object => object.id || object.idLocal).flat();
        const data = latestData(config.productCode);

        // Convert query ids.
        template.authConfig.path = ids.length > 0 ? Object.entries(data).filter(([_key, value]) => {
            try {
                return hasMatchingIds((value.data || {}).decks || [], ids);
            } catch (err) {
                winston.log('error', `500 | kone-elevator-movement | ${config.productCode ? `productCode=${config.productCode} | ` : ''}${err.message}`);
            }
            return false;
        }).map(([key, _value]) => key) : Object.keys(data);
        return template;
    } catch (err) {
        winston.log('error', `500 | kone-elevator-movement | ${config.productCode ? `productCode=${config.productCode} | ` : ''}${err.message}`);
        return template;
    }
};

/**
 * Handles data.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    const items = [];
    try {
        // Elevator left.
        items.push(...((response.data || {}).decks || []).map(d => ({
            terminal: d.deckIndex,
            name: d.startFloor.marking,
            id: d.startFloor.floorIndex,
            value: false,
        })));
        // Elevator arrived.
        items.push(...((response.data || {}).decks || []).map(d => ({
            terminal: d.deckIndex,
            name: d.stopFloor.marking,
            id: d.stopFloor.floorIndex,
            value: true,
        })));
        // Filter result.
        const ids = (_.get(config, 'parameters.ids') || []).map(object => object.id || object.idLocal).flat();
        // TODO: Filter only latest values.
        return items.filter(i => ids.includes(i.id) || ids.length === 0);
    } catch (e) {
        return items;
    }
};

/**
 * Move options from static to authConfig.
 *
 * @param {Object} template
 * @return {Object}
 */
const authConfig = template => ({
    productCode: template.productCode || template.config.productCode,
    ...template.authConfig,
    ...(template.config || {}).static,
});

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'kone-elevator-movement',
    template,
    request: (template, options) => {
        template.authConfig = authConfig(template);
        return options;
    },
    response,
    connect: async (config) => {
        try {
            const oauth2 = config.template.plugins.find(p => p.name === 'oauth2');
            const template = {...config.template, config};
            template.authConfig = authConfig(template);
            const requestOptions = await oauth2.request(template, {});
            // Make sure hook exists.
            const webhookEndpoint = `${process.env.CONNECTOR_URL}/connector/v2/hooks/${config.productCode}`;
            const hooks = await fetch('get',`${template.authConfig.url}/api/v1/application/self/webhooks`, requestOptions.headers);
            const myHooks = (hooks || []).filter(h => h.webhookEndpoint === webhookEndpoint);
            if (myHooks.length === 0) {
                // Need to create hooks.
                const body = {
                    types: [
                        'com.kone.elevator.movement.completed.v1',
                    ],
                    webhookEndpoint,
                    endpointSecret: 'REPLACE_WITH_SECRET',
                    contactEmail: 'example@example.com',
                    subscriptionName: 'Connector hook',
                };
                const create = await fetch('post',`${template.authConfig.url}/api/v1/application/self/webhooks`, requestOptions.headers, body);
                winston.log('info', `${config.productCode}: Created webhook with id ${create.id}.`);
            } else {
                if (myHooks[0].status === 'DISABLED') {
                    const enable = await fetch('patch',`${template.authConfig.url}/api/v1/application/self/webhooks/${myHooks[0].id}`, requestOptions.headers, {status: 'ENABLED'});
                    winston.log('info', `${config.productCode}: Enabled webhook with id ${enable.id}.`);
                }
                // const disable = await fetch('patch',`${template.authConfig.url}/api/v1/application/self/webhooks/${myHooks[0].id}`, requestOptions.headers, {status: 'DISABLED'});
                // console.log(disable);
                // const remove = await fetch('delete',`${template.authConfig.url}/api/v1/application/self/webhooks/${myHooks[0].id}`, requestOptions.headers);
                // console.log(remove);
            }
        } catch (err) {
            winston.log('error', `500 | kone-elevator-movement | ${config.productCode ? `productCode=${config.productCode} | ` : ''}${err.message}`);
        }
    },
};
