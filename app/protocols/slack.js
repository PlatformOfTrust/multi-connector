'use strict';
/**
 * Module dependencies.
 */
const _ = require('lodash');
const rp = require('request-promise');
const winston = require('../../logger.js');
const response = require('../lib/response');
const bolded = text => `*${text}*`;
const toText = (data, fallback = '') =>
    typeof data !== 'string'
        ? JSON.stringify(data || fallback, undefined, 2).slice(0, -1).slice(0, 1000)
        : (data || fallback).slice(0, 1000);

/**
 * Send slack messages.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Array}
 */
const sendData = async (config, pathArray) => {
    const items = [];

    /** Data fetching. */
    try {
        // Initialize options.
        let options = {};

        // Execute request plugin function.
        for (let i = 0; i < (config.plugins || []).length; i++) {
            if (config.plugins[i].request) {
                options = await config.plugins[i].request(config, options);
            }
        }

        // Send slack message.
        for (let p = 0; p < pathArray.length; p++) {
            config.index = p;
            let result;
            try {
                const message = _.isObject(pathArray[p]) ? pathArray[p]: {text: pathArray[p]};
                const hasError = Object.hasOwnProperty.call(message, 'error') && message.error !== undefined && message.error !== null;
                const blocks = [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: `${hasError ? ':x:' : ':white_check_mark:'} - ${toText(message.data)}`,
                            emoji: true,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `${bolded('ID:')}\n${toText(message.id)}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `${bolded('Timestamp:')}\n${new Date().toISOString()}`,
                            },
                        ],
                    },
                    ...(hasError ? [
                        {
                            type: 'section',
                            fields: [
                                {
                                    type: 'mrkdwn',
                                    text: `${bolded('Error:')}\n${toText(message.error, 'Empty')}`,
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `${bolded('ProductCode:')}\n${toText((message.error || {}).productCode, 'N/A')}`,
                                },
                            ],
                        },
                    ] : [])];
                result = await rp({method: 'POST', url: config.authConfig.url, body: {blocks}, json: true});
            } catch (err) {
                winston.log('error', err.message);
            }
            const item = await response.handleData(config, pathArray[p], p, result);
            if (item) items.push(item);
        }
    } catch (err) {
        winston.log('error', err.message);

        // Execute onerror plugin function.
        for (let i = 0; i < (config.plugins || []).length; i++) {
            if (config.plugins[i].onerror) {
                return await config.plugins[i].onerror(config, err);
            }
        }
    }

    return items;
};

/**
 * Expose library functions.
 */
module.exports = {
    sendData,
};
