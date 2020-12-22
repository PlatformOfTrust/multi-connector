'use strict';
/**
 * Module dependencies.
 */
const composeOutput = require('../../app/lib/connector').composeOutput;
const transformer = require('../../app/lib/transformer');
const router = require('express').Router();
const cache = require('../../app/cache');
const rsa = require('../../app/lib/rsa');
const moment = require('moment');
const net = require('net');


/**
 * C4 CALS  plugin.
 */

/**
 * Attaches config defined in the url.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Callback} next
 */
const getConfig = function (req, res, next) {
    try {
        const productCode = req.params[0].split('/')[0];
        req.endpoint = req.params[0].split('/')[1];
        const code = req.query['code'];
        const config = cache.getDoc('configs', productCode) || {};
        const template = config ? cache.getDoc('templates', config.template) || {} : {};
        req.config = {...template, authConfig: {
            ...template.authConfig,
            ...config.static,
            productCode,
            code,
            connectorURL: req.protocol + '://' + req.get('host'),
        }};
    } catch (err) {
        // Compose error response object.
        const result = {
            error: {
                status: err.httpStatusCode || 500,
                message: err.message || 'Internal Server Error.',
            },
        };

        // Send response.
        return res.status(err.httpStatusCode || 500).send(result);
    }
    next();
};

// Store failed authorization attempts.
const failures = {};

/** Limiter definitions. */
const MINS10 = 600000, MINS30 = 3 * MINS10;

/** Static token. */
const TOKEN = '2AscDD3sxEGBznqKYAedpFyRAngtsVqnhwywjNRXWvEymt5jZ4pGzNRjxCSsk2dj';

// Clean limiter.
setInterval(function () {
    for (const ip in failures) {
        if (Date.now() - failures[ip].resetTime > MINS10) {
            delete failures[ip];
        }
    }
}, MINS30);

/**
 * Returns ip address from request.
 *
 * @param {Object} req
 */
const getRemoteIP = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        req.socket.remoteAddress || req.connection.socket.remoteAddress;
};

/**
 * Removes failed authentication attempts on authentication success.
 *
 * @param {Object} req
 */
const authSuccess = function (req) {
    delete failures[getRemoteIP(req)];
};

/**
 * Stores failed authentication attempts.
 *
 * @param {Object} req
 */
const authFailed = function (req) {
    const remoteIP = getRemoteIP(req);
    const f = failures[remoteIP] = failures[remoteIP] || {count: 0, resetTime: new Date()};
    ++f.count;
    // Wait 30 seconds for every failed attempt.
    f.resetTime.setTime(Date.now() + 30000 * f.count);
};

/**
 * Limiter middleware.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const limiter = function (req, res, next) {
    const remoteIp = getRemoteIP(req);
    const f = failures[remoteIp];
    if (f && Date.now() < f.resetTime) {
        req.rateLimit = {
            remaining: 0,
            resetTime: f.resetTime,
        };
    }
    next();
};

/** Mockup for testing */
const demand = {
    Instance: 'Instance001',
    DemandSupplyId: 'DemandSupplyId002',
    VendorId: 'VendorId003',
    VendorName: 'TestVendor',
    VendorStreetAddress: 'TestStreetAddress',
    VendorPostalCode: 'TestPostalCode',
    VendorTown: 'TestVendorTown',
    VendorCountry: 'TestVendorCountry',
    CustomerId: 'CustomerId004',
    CustomerName: 'TestCustomerName',
    ProjectId: 'ProjectId005',
    ProjectName: 'TestProjectName',
    ProjectNumber: 'TestProjectNumber',
    ShipToId: 'ShipToId006',
    ShipToName: 'TestShipToName',
    ShipToStreetAddress: 'TestShipToStreetAddress',
    ShipToPostalCode: 'TestShipToPostalCode',
    ShipToTown: 'TestShipToTown',
    ShipToCountry: 'TestShipToCountry',
    DemandWeek: 'TestDemandWeek',
};

const demandItem = {
    DemandSupplyItemId: 'MaterialId007',
    MaterialId: 'MaterialId008',
    MaterialExternalId: 'MaterialExternalId009',
    MaterialName: 'TestMaterialName1',
    MaterialPrimaryCode: 'TestMaterialPrimaryCode1',
    MaterialPrimaryCodeType: 'TestMaterialPrimaryCodeType1',
    MaterialSecondaryCode: 'TestMaterialSecondaryCode1',
    MaterialSecondaryCodeType: 'TestMaterialSecondaryCodeType1',
    DemandQuantity: 10,
    UnitOfMeasure: 'pcs',
};

const demandList = [];
const numberOfDemands = 4;

// Generate random demand for testing.
for (let d = 1; d <= numberOfDemands; d++) {
    const entry = {...demand};
    entry.Instance = 'Instance' + d;
    entry.DemandSupplyId = 'DemandSupplyId' + d;
    entry.VendorId = 'VendorId' + d;
    entry.CustomerId = 'CustomerId' + d;
    entry.ProjectId = 'ProjectId' + d;
    entry.ShipToId = 'ShipToId' + d;
    entry.DemandItems = [];
    entry.SupplyItems = [];
    const numberOfDemands = Math.floor(Math.random() * 10) + 1;
    for (let i = 1; i <= numberOfDemands; i++) {
        const item = {...demandItem};
        item.DemandSupplyItemId = 'DemandSupplyItemId' + d + '' + i;
        item.MaterialId = 'MaterialId' + d + '' + i;
        item.MaterialExternalId = 'MaterialExternalId' + d + '' + i;
        item.MaterialName = 'MaterialName' + d + '' + i;
        item.DemandQuantity = Math.floor(Math.random() * 20) + 5;
        entry.DemandItems.push(item);
    }
    demandList.push(entry);
}

const response = async (config, res) => {
    /** Find by vendor ID */
    try {
        return demandList.filter(d => d.VendorId === config.parameters.targetObject.VendorId);
    } catch (e) {
        return [];
    }
};

/**
 * Returns plugin HTTP endpoints.
 *
 * @param {Object} passport
 * @return {Object}
 */
const endpoints = function (passport) {
    // GET endpoints.
    router.get('/*', getConfig, async (req, res, next) => {
        try {
            let demand;
            const redirectURL = req.protocol + '://' + req.get('host') + '/translator/v1/plugins/c4-cals/' + req.config.authConfig.productCode + '/demand';
            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            res.write('<!doctype html><html>' +
                '<head><title>C4 CALS plugin</title>' +
                '    <style>\n' +
                '      label {\n' +
                '        display: inline-block;\n' +
                '        width: 150px;\n' +
                '        text-align: right;\n' +
                '        margin: 4px;\n' +
                '      }\n' +
                '    </style>' +
                '</head>' +
                '<body style="margin-top: 50px; text-align: center;"><h2><b>C4 CALS</b></h2>');
            /** Pages. */
            switch (req.endpoint) {
                /** Demand page. */
                case 'demand':
                    if (req.query.token !== TOKEN) {
                        // res.write('Unauthorized');
                        // break;
                    }
                    res.write(
                        '<b>Demand list</b>:<br>');
                    for (let i = 0; i < demandList.length; i++) {
                        /** Demand details */
                        res.write(
                            '<div style="position: relative; max-width: 600px; margin: auto;"><textarea readonly name="text" cols="25" rows="5" style="width: 100%; height: 200px;">' +
                            JSON.stringify(demandList[i], null, 2) + '</textarea>');
                        /** Confirm supply button */
                        const redirectURL = req.protocol + '://' + req.get('host') + '/translator/v1/plugins/c4-cals/'
                            + req.config.authConfig.productCode + '/supply?instance=' + demandList[i].Instance;
                        res.write('<input type="button" style="position: absolute; right: 15px; top: 5px;" onclick="location.href=\'' + redirectURL
                            + '\';" value="Confirm Supply" /></div>');
                    }
                    break;
                /** Supply confirmation page. */
                case 'supply':
                    demand = demandList.find(d => d.Instance === req.query.instance);
                    if (!demand) {
                        res.write('<p>Demand not found.</p><br>' +
                            '<input type="button" onclick="location.href=\'' + redirectURL + '\';" value="Back" />');
                        break;
                    }
                    res.write('<h4>Supply confirmation page</h4>' +
                        '<p>To confirm supply input the following information.</p><br>' +
                        '<form action="?token=' + TOKEN + '" method="post">' +
                        '<label for="client_secret"><b>Instance</b>:</label>' +
                        '<input type="text" id="instance" name="Instance" value="' + demand.Instance + '" readonly><br>' +
                        '<label for="demand_supply_id"><b>DemandSupplyId</b>:</label>' +
                        '<input type="text" id="demand_supply_id" name="DemandSupplyId" value="' + demand.DemandSupplyId + '" readonly><br>');
                    for (let i = 0; i < demand.DemandItems.length; i++) {
                        res.write(
                            '<label for="item' + i + '_material_name" style="margin-top: 10px;"><b>SupplyItem ' + i + ' Material Name</b>:</label>' +
                            '<input type="text" id="item' + i + '_material_name" name="SupplyItems[' + i + '][UnitOfMeasure]" value="' + demand.DemandItems[i].MaterialName + '" readonly disabled="disabled"><br>' +
                            '<label for="item' + i + '_demand_quantity"><b>DemandQuantity</b>:</label>' +
                            '<input type="number" id="item' + i + '_demand_quantity" name="SupplyItems[' + i + '][DemandQuantity]" value="' + demand.DemandItems[i].DemandQuantity + '" readonly disabled="disabled"><br>' +
                            '<label for="item' + i + '_demand_supply_item_id"><b>DemandSupplyItemId</b>:</label>' +
                            '<input type="text" id="item' + i + '_demand_supply_item_id" name="SupplyItems[' + i + '][DemandSupplyItemId]" value="' + demand.DemandItems[i].DemandSupplyItemId + '" readonly"><br>' +
                            '<label for="item' + i + '_supply_quantity"><b>SupplyQuantity</b>:</label>' +
                            '<input type="number" id="item' + i + '_supply_quantity" name="SupplyItems[' + i + '][SupplyQuantity]" min="0" value="0"><br>' +
                            '<label for="item' + i + '_unit_of_measure"><b>UnitOfMeasure</b>:</label>' +
                            '<input type="text" id="item0_unit_of_measure" name="SupplyItems[' + i + '][UnitOfMeasure]" value="' + demand.DemandItems[i].UnitOfMeasure + '" readonly><br>');
                    }
                    res.write('<input type="button" onclick="location.href=\'' + redirectURL + '\';" value="Cancel" />' +
                        '<input type="submit" value="Submit" style="margin: 20px;">' +
                        '</form>');
                    break;
            }
            res.write('</body></html>');
            res.end();
        } catch (e) {
            if (!res.finished) {
                res.write('Error');
                res.end();
            }
        }
    });
    // POST endpoints.
    router.post('/*', limiter, getConfig, async (req, res, next) => {
        try {
            const host = req.get('host').split(':')[0];
            let demand;
            let result;
            let signature;
            const supply = {};
            const redirectURL = req.protocol + '://' + req.get('host') + '/translator/v1/plugins/c4-cals/' + req.config.authConfig.productCode + '/demand';
            /** Pages. */
            switch (req.endpoint) {
                /** Supply page. */
                case 'supply':
                    demand = demandList.find(d => d.Instance === req.body.Instance);
                    if (!demand) {
                        res.json(404, 'Demand not found');
                        break;
                    }
                    supply.Instance = req.body.Instance;
                    supply.DemandSupplyId = req.body.DemandSupplyId;
                    if (Array.isArray(req.body.SupplyItems)) {
                        supply.SupplyItems = req.body.SupplyItems.map(i => {
                            try {
                                const demandItem = demand.DemandItems.find(d => d.DemandSupplyItemId === i.DemandSupplyItemId);
                                const supplyItem = demand.SupplyItems.find(d => d.DemandSupplyItemId === i.DemandSupplyItemId);
                                if (!demandItem) return undefined;
                                const SupplyQuantity = Number.parseInt(i.SupplyQuantity);
                                if (SupplyQuantity <= 0) return undefined;
                                // Subtract supply quantity from demand quantity.
                                demandItem.DemandQuantity = Math.max(demandItem.DemandQuantity - SupplyQuantity, 0);
                                // Store supply.
                                demand.SupplyItems.push({
                                    DemandSupplyItemId: i.DemandSupplyItemId,
                                    SupplyQuantity,
                                    UnitOfMeasure: i.UnitOfMeasure,
                                });
                                return {
                                    DemandSupplyItemId: i.DemandSupplyItemId,
                                    SupplyQuantity,
                                    UnitOfMeasure: i.UnitOfMeasure,
                                };
                            } catch (e) {
                                return undefined;
                            }
                        }).filter(s => !!s);
                    }

                    result = await composeOutput(req.config,[supply]);

                    // Initialize signature object.
                    signature = {
                        type: 'RsaSignature2018',
                        created: moment().format(),
                        creator: (host === 'localhost' || net.isIP(host) ? 'http' : 'https')
                            + '://' + req.get('host') + '/translator/v1/public.key',
                    };

                    // Send signed data response.
                    res.status(201).send({
                        ...(result.output || {}),
                        redirectURL,
                        signature: {
                            ...signature,
                            signatureValue: rsa.generateSignature({
                                __signed__: signature.created,
                                ...(result.output[result.payloadKey || 'data'] || {}),
                            }),
                        },
                    });
                    break;
            }
        } catch (e) {
            if (!res.finished) {
                res.write('Error ' + e.message);
                res.end();
            }
        }
    });
    return router;
};

/**
 * Handles data objects.
 *
 * @param {Object} config
 * @param {Object/String} id
 * @param {Object} data
 * @return {Object}
 */
const handleData = function (config, id, data) {
    let result = {};
    try {
        for (let j = 0; j < data.length; j++) {
            const value = data[j][config.output.value];
            result = {
                demandSupply: {
                    '@type': 'DemandSupply',
                    ...value,
                },
            };
            // TODO: Transform with a schema.
            // result = transformer.transform(value, schema.properties.data);
        }
        return result;
    } catch (err) {
        return result;
    }
};

/**
 * Transforms output to Platform of Trust context schema.
 *
 * @param {Object} config
 * @param {Object} output
 * @return {Object}
 */
const output = async (config, output) => {
    // Initialize harmonized output.
    const result = {
        [config.output.context]: config.output.contextValue,
        [config.output.object]: {
            [config.output.array]: [],
        },
    };

    // Hand over data objects to transformer.
    try {
        const array = output.data[config.output.array];
        for (let i = 0; i < array.length; i++) {
            result[config.output.object][config.output.array].push(
                handleData(
                    config,
                    array[i][config.output.id],
                    array[i][config.output.data],
                ));
        }
        if (result[config.output.object][config.output.array].length === 1) {
            result[config.output.object] =
                result[config.output.object][config.output.array][0];
        } else {
            result[config.output.object][config.output.array] =
                result[config.output.object][config.output.array].map((o => {
                    return Object.values(o);
                })).flat(2);
        }
        return result;
    } catch (err) {
        return output;
    }
};

module.exports = {
    name: 'c4-cals',
    response,
    endpoints,
    output,
};
