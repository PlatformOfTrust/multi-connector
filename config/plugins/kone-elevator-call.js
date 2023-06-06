'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const {uuidv4} = require('../../app/lib/utils');
const websocket = require('../../app/protocols/websocket');

/**
 * Kone elevator call plugin.
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
        if (Object.hasOwnProperty.call(template.parameters, 'action')) {
            // Elevator call
            //
            // Action: 2 - destination call
            // - area = source floor area id
            // - destination = destination floor area id
            //
            // Action: 2002 - landing call
            // - area = source floor area id
            //
            // Action: 5000 - car call
            // - area = lift deck area id
            // - destination = destination floor area id

            const request_id = parseInt(uuidv4(), 16);
            const call = {
                action: template.parameters.action,
                destination: template.parameters.destination,
            };
            const messages = template.parameters.ids.map(id => ({
                type: 'lift-call-api-v2',
                buildingId: id.buildingId,
                callType: 'action',
                groupId: (id.groupId || '').toString(),
                payload: {
                    request_id,
                    area: id.idLocal,
                    time: new Date().toISOString(),
                    terminal: id.terminal,
                    call,
                },
            }));
            const result = [];
            for (let i = 0; i < messages.length; i++) {
                const response = await websocket.sendData(template, [{id: request_id, data: messages[i]}]);
                result.push(...(Array.isArray(result) ? response : [response]));
            }
            template.authConfig.path = (Array.isArray(result) ? result : []);
            template.protocol = 'custom';
            template.schema = 'process-v4_kone';
        } else {
            // TODO: Presence query.
        }
        return template;
    } catch (err) {
        winston.log('error', `500 | kone | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
        return template;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'kone',
    template,
};
