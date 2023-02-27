'use strict';
const RPCClient = require('jsonrpc2-ws').Client;
const WebSocket = require('rpc-websockets').Client;

/**
 * Cooper iLight.
 *
 */

/**
 * Requests data with JSON-RPC.
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        // TODO: Select better npm module.
        const jsonrpc2 = true;
        if (jsonrpc2) {
            const client = new RPCClient('ws://10.79.114.92/eg/');

            // connection handling
            client.on('connected', async () => {
                console.log('isConnected: ' + client.isConnected());
                // request auth
                try {
                    await client.call('LogIn', {
                        username: 'commissioner',
                        password:'CooperLS',
                    });
                    console.log('Logged in');
                } catch (e) {
                    console.error('auth', 'Authentication Error:', e);
                }

                try {
                    await client.call('AttributeChangeAlert', {});
                } catch (e) {
                    console.log('Subscribe Error:', e);
                }

                /*
                const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8)
                    return v.toString(16)
                });
                const data = {
                    jsonrpc: "2.0",
                    id,
                    method: 'Login',
                    params: {
                        username: 'commissioner',
                        password: 'CooperLS'
                    }
                };
                try {
                    const res = await client.send(JSON.stringify(data));
                    console.log(res)
                } catch (err) {
                    console.error(err.message);
                }
                */
                console.log('auth', 'Authenticated.');
            });
        } else {
            // instantiate Client and connect to an RPC server
            const ws = new WebSocket('ws://10.79.114.92:80/eg/');

            ws.on('open', async () => {
                console.log('open');

                /*
                // login your client to be able to use protected methods
                ws.login({'username': 'commissioner', 'password':'CooperLS'}).then(function() {
                    console.log('logged')
                }).catch(function(error) {
                    console.log('auth failed')
                })
                */

                // call an RPC method with parameters
                await ws.call('LogIn', {
                    username: 'commissioner',
                    password: 'CooperLS',
                }).then(function (result) {
                    console.log(result);
                }).catch(function (error) {
                    console.log(error);
                });

                /*
                try {
                    console.log('listMethods')
                    const methods = await ws.listMethods();
                    console.log(methods)
                } catch (err) {
                    console.log(err.message)
                }
                */

                /*
                setInterval(() => {
                    console.log(JSON.stringify(ws.queue))
                }, 5000)
                */
                ws.on('Occurrence', function (result) {
                    console.log(result);
                });
                ws.on('Recurrence', function (result) {
                    console.log(result);
                });
                // close a websocket connection
                ws.close();
            });
        }
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'airwits',
    response,
};
