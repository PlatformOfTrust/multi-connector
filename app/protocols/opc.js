'use strict';
/**
 * Module dependencies.
 */
const async = require('async');
const response = require('../lib/response');
const winston = require('../../logger.js');

const {
    OPCUAClient,
    MessageSecurityMode, SecurityPolicy,
    AttributeIds,
    makeBrowsePath,
    ClientSubscription,
    TimestampsToReturn,
    MonitoringParametersOptions,
    ReadValueIdLike,
    ClientMonitoredItem,
    DataValue,
} = require('node-opcua');

/**
 * Initiates data requests, but relies on plugin to fetch the data.
 *
 * @param {Object} config
 * @param {Array} pathArray
 * @return {Array}
 */
const getData = async (config, pathArray) => {


    const connectionStrategy = {
        initialDelay: 1000,
        maxRetry: 1,
    };
    const options = {
        applicationName: 'MyClient',
        connectionStrategy: connectionStrategy,
        securityMode: MessageSecurityMode.None,
        securityPolicy: SecurityPolicy.None,
        endpoint_must_exist: false,
    };

    const client = OPCUAClient.create(options);
    // const endpointUrl = "opc.tcp://opcuademo.sterfive.com:26543";
    const endpointUrl = 'opc.tcp://' + config.authConfig.url + ':26543';

    const items = [];
    // const client = OPCUAClient.create({endpoint_must_exist: false});
    // const endpointUrl = 'opc.tcp://' + config.authConfig.url + ':26543';
    // const nodeId = 'ns=7;s=Scalar_Simulation_Double';

    // 12:30:45.870Z :client_tcp_transport          :48    [NODE-OPCUA-E05] this transport protocol is not supported :http:

    const theSession = null;
    const theSubscription = null;

    console.log(endpointUrl);
    try {
        // step 1 : connect to
        await client.connect(endpointUrl);
        console.log('connected !');

        // step 2 : createSession
        const session = await client.createSession();
        console.log('session created !');

        // step 3 : browse
        const browseResult = await session.browse('RootFolder');

        console.log('references of RootFolder :');
        for (const reference of browseResult.references) {
            console.log('   -> ', reference.browseName.toString());
        }


        // step 4 : read a variable with readVariableValue
        const dataValue2 = await session.readVariableValue('ns=3;s=Scalar_Simulation_Double');
        console.log(' value = ' , dataValue2.toString());

        // step 4' : read a variable with read
        const maxAge = 0;
        const nodeToRead = {
            nodeId: 'ns=3;s=Scalar_Simulation_String',
            attributeId: AttributeIds.Value,
        };
        const dataValue =  await session.read(nodeToRead, maxAge);
        console.log(' value ' , dataValue.toString());

        // step 5: install a subscription and install a monitored item for 10 seconds
        const subscription = ClientSubscription.create(session, {
            requestedPublishingInterval: 1000,
            requestedLifetimeCount:      100,
            requestedMaxKeepAliveCount:   10,
            maxNotificationsPerPublish:  100,
            publishingEnabled: true,
            priority: 10,
        });

        subscription.on('started', function () {
            console.log('subscription started for 2 seconds - subscriptionId=', subscription.subscriptionId);
        }).on('keepalive', function () {
            console.log('keepalive');
        }).on('terminated', function () {
            console.log('terminated');
        });


        // install monitored item

        /*

        const itemToMonitor: ReadValueIdLike = {
            nodeId: "ns=3;s=Scalar_Simulation_Float",
            attributeId: AttributeIds.Value
        };
        const parameters: MonitoringParametersOptions = {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 10
        };

        const monitoredItem  = ClientMonitoredItem.create(
            subscription,
            itemToMonitor,
            parameters,
            TimestampsToReturn.Both
        )

        monitoredItem.on("changed", (dataValue: DataValue) => {
            console.log(" value has changed : ", dataValue.value.toString());
        });

        async function timeout(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        await timeout(10000);

        */

        console.log('now terminating subscription');
        await subscription.terminate();



        // step 6: finding the nodeId of a node by Browse name
        const browsePath = makeBrowsePath('RootFolder', '/Objects/Server.ServerStatus.BuildInfo.ProductName');

        const result = await session.translateBrowsePath(browsePath);
        const productNameNodeId = result.targets[0].targetId;
        console.log(' Product Name nodeId = ', productNameNodeId.toString());

        // close session
        await session.close();

        // disconnecting
        await client.disconnect();
        console.log('done !');
    } catch (err) {
        console.log('An error has occured : ',err);
    }

    /*

    async.series([


        // step 1 : connect to
        function (callback) {
            console.log('step 1 : connect to');

            client.connect(endpointUrl, function (err) {
                console.log(err);

                if (err) {
                    console.log(' cannot connect to endpoint :', endpointUrl);
                } else {
                    console.log('connected !');
                }
                callback(err);
            });
        },
        // step 2 : createSession
        function (callback) {
            console.log('step 2 : createSession');
            client.createSession(function (err, session) {
                if (!err) {
                    theSession = session;
                }
                callback(err);
            });

        },
        // step 3 : browse
        function (callback) {
            console.log('step 3 : browse');
            theSession.browse('RootFolder', function (err, browse_result) {
                if (!err) {
                    browse_result.references.forEach(function (reference) {
                        console.log(reference.browseName);
                    });
                }
                callback(err);
            });
        },
        // step 4 : read a variable
        function (callback) {
            console.log('step 4 : read a variable');
            theSession.read({
                nodeId,
                attributeId: AttributeIds.Value,
            }, (err, dataValue) => {
                if (!err) {
                    console.log(' read value = ', dataValue.toString());
                }
                callback(err);
            });
        },

        // step 5: install a subscription and monitored item
        //
        // -----------------------------------------
        // create subscription
        function (callback) {

            theSession.createSubscription2({
                requestedPublishingInterval: 1000,
                requestedLifetimeCount: 1000,
                requestedMaxKeepAliveCount: 20,
                maxNotificationsPerPublish: 10,
                publishingEnabled: true,
                priority: 10,
            }, function (err, subscription) {
                if (err) { return callback(err); }
                theSubscription = subscription;

                theSubscription.on('keepalive', function () {
                    console.log('keepalive');
                }).on('terminated', function () {
                });
                callback();
            });

        }, function (callback) {
            // install monitored item
            //
            theSubscription.monitor({
                nodeId,
                attributeId: AttributeIds.Value,
            },
            {
                samplingInterval: 100,
                discardOldest: true,
                queueSize: 10,
            }, TimestampsToReturn.Both,
            (err, monitoredItem) => {
                console.log('-------------------------------------');
                monitoredItem
                    .on('changed', function (value) {
                        console.log(' New Value = ', value.toString());
                    })
                    .on('err', (err) => {
                        console.log('MonitoredItem err =', err.message);
                    });
                callback(err);

            });
        }, function (callback) {
            console.log('Waiting 5 seconds');
            setTimeout(() => {
                theSubscription.terminate();
                callback();
            }, 5000);
        }, function (callback) {
            console.log(' closing session');
            theSession.close(function (err) {
                console.log(' session closed');
                callback();
            });
        },

    ],
    function (err) {
        if (err) {
            console.log(' failure ', err);
            process.exit(0);
        } else {
            console.log('done!');
        }
        client.disconnect(function () { });
    });
    */

    /** Data fetching. */
    try {
        // Initialize options.
        let options = {};

        // Execute request plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
            if (config.plugins[i].request) {
                options = await config.plugins[i].request(config, options);
            }
        }

        for (let p = 0; p < pathArray.length; p++) {
            const item = await response.handleData(config, pathArray[p], p, pathArray[p]);
            if (item) items.push(item);
        }
    } catch (err) {
        winston.log('error', err.message);

        // Execute onerror plugin function.
        for (let i = 0; i < config.plugins.length; i++) {
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
    getData,
};
