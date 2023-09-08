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

            /** Testing */

            /*
            const configMessages = template.parameters.ids.map(id => ({
                type: 'common-api',
                requestId: parseInt(uuidv4(), 16).toString(),
                buildingId: id.buildingId,
                callType: 'config',
                groupId: (id.groupId || '').toString(),
            }));

            const elevatorConfigs = await Promise.all(configMessages.map(async (c) => await websocket.sendData(template, [{id: c.requestId, data: c}])));

            const actionMessages = template.parameters.ids.map(id => ({
                type: 'common-api',
                requestId: parseInt(uuidv4(), 16).toString(),
                buildingId: id.buildingId,
                callType: 'actions',
                groupId: (id.groupId || '').toString(),
            }));

            const elevatorActions = await Promise.all(actionMessages.map(async (c) => await websocket.sendData(template, [{id: c.requestId, data: c}])));
            */

            // Generate request ids.
            template.parameters.ids = template.parameters.ids.map(id => ({...id, requestId: parseInt(uuidv4(), 16).toString()}));

            // Initialize call.
            const call = {
                action: template.parameters.action,
                destination: template.parameters.destination,
            };

            // Compose messages.
            const messages = template.parameters.ids.map(id => ({
                type: 'lift-call-api-v2',
                buildingId: id.buildingId,
                callType: 'action',
                groupId: (id.groupId || '').toString(),
                payload: {
                    request_id: id.requestId,
                    area: id.idLocal,
                    time: new Date().toISOString(),
                    terminal: id.terminal,
                    call,
                },
            }));

            const result = [];
            for (let i = 0; i < messages.length; i++) {
                let items = [];
                try {
                    // By default, the connection is closed after the client is not expecting any more state events from the call.
                    await websocket.connect(template, template.productCode);
                    const request_id = messages[i].payload.request_id;
                    const response = await websocket.sendData(template, [{id: request_id, data: messages[i]}]);
                    items = Array.isArray(result) ? response : [response];
                } catch (err) {
                    winston.log('error', `500 | kone-elevator-call | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
                }
                try {
                    items = items.map(item => (item.data || {}).success ? {...item, data: {...item.data, message: 'Action completed.'}} : item);
                } catch (err) {
                    winston.log('error', `500 | kone-elevator-call | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
                }
                result.push(...items);
            }
            template.authConfig.path = (Array.isArray(result) ? result : []);
            template.protocol = 'custom';
            template.schema = 'process-v4_kone';
        }
        return template;
    } catch (err) {
        winston.log('error', `500 | kone-elevator-call | ${template.productCode ? `productCode=${template.productCode} | ` : ''}${err.message}`);
        return template;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'kone-elevator-call',
    template,
};
