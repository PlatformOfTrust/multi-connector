'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const fetch = require('../../app/lib/request');

/**
 * Kone movement data plugin.
 */

/**
 * Switch querying to Data Storage.
 *
 * @param {Object} config
 * @param {Object} template
 * @return {Object}
 */
const template = async (config, template) => {
    try {
        return template;
    } catch (err) {
        winston.log('error', `500 | kone | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
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
        items.push(...response.data.decks.map(d => ({
            terminal: d.deckIndex,
            name: d.startFloor.marking,
            id: d.startFloor.floorIndex,
            value: 'UNOCCUPIED',
        })));
        // Elevator arrived.
        items.push(...response.data.decks.map(d => ({
            terminal: d.deckIndex,
            name: d.stopFloor.marking,
            id: d.stopFloor.floorIndex,
            value: 'OCCUPIED',
        })));
        return items;
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
    name: 'kone',
    template,
    request: (template, options) => {
        template.authConfig = authConfig(template);
        return options;
    },
    response,
    stream: (template, data) => {
        // console.log('Stream');
        // console.log(template);
        // console.log(data);
        return [];
    },
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
                // const disable = await fetch('patch',`${template.authConfig.url}/api/v1/application/self/webhooks/${myHooks[0].id}`, requestOptions.headers, {status: 'DISABLED'});
                // console.log(disable);
                // const remove = await fetch('delete',`${template.authConfig.url}/api/v1/application/self/webhooks/${myHooks[0].id}`, requestOptions.headers);
                // console.log(remove);
            }
        } catch (err) {
            winston.log('error', `500 | kone | ${config.productCode ? `productCode=${config.productCode} | ` : ''}${err.message}`);
        }
    },
};
