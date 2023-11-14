'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const _ = require('lodash');

/**
 * Combines keys and values from two arrays to an object.
 *
 * @param {Array} arrays
 * @return {Object}
 */
const mapArrays = function (arrays) {
    const dataObject = [];
    if (arrays.length >= 2) {
        if (Array.isArray(arrays[1][0])) {
            for (let a = 0; a < arrays[1].length; a++) {
                const object = {};
                for (let b = 0; b < arrays[1][a].length; b++) {
                    object[arrays[0][b]] = arrays[1][a][b];
                }
                dataObject.push(object);
            }
        } else {
            const object = {};
            for (let b = 0; b < arrays[1].length; b++) {
                object[arrays[0][b]] = arrays[1][b];
            }
            dataObject.push(object);
        }
        return dataObject;
    } else {
        return dataObject;
    }
};

/**
 * Picks value from response object by object property path or index.
 *
 * @param {Object} config
 * @param {String} path
 *   Resource path.
 * @param {Object} object
 *   Target object.
 * @param {String} key
 *   Config property key.
 * @return {Object/String}
 */
function getValueFromResponse (config, path, object, key) {
    if (config[key]) {
        if (config[key].dataObjectProperty) {
            return _.get(object, config[key].dataObjectProperty);
        }
        if (config[key].pathIndex) {
            if (Array.isArray(config[key].pathIndex)) {
                return config[key].pathIndex.map(index => path.split('/')[index]).join('/');
            } else {
                return path.split('/')[config[key].pathIndex];
            }
        }
    }
    return undefined;
}

/**
 * Handles response data.
 *
 * @param {Object} config
 * @param {String} path
 * @param {Number} index
 * @param {Object} data
 * @return {Promise}
 */
const handleData = async (config, path, index, data) => {
    // Execute response plugin function.
    for (let i = 0; i < config.plugins.length; i++) {
        if (config.plugins[i].response) {
            data = await config.plugins[i].response(config, data);
        }
    }

    // Validate data object.
    if (!_.isObject(data)) return Promise.resolve();
    if (Object.keys(data).length === 0) return Promise.resolve();

    // Validate data object configurations.
    if (!config.dataPropertyMappings || !config.dataObjects) {
        winston.log('error', 'Configuration dataPropertyMappings or dataObjects missing.');
        return Promise.resolve();
    }

    // Define response as data object by default.
    if (config.dataObjects.length < 1) config.dataObjects = [''];

    const measurements = [];

    // Define output key names for data objects.
    const keys = {
        timestamp: _.get(config, 'output.timestamp') || 'timestamp',
        data: _.get(config, 'output.data') || 'measurements',
        value: _.get(config, 'output.value') || 'value',
        name: _.get(config, 'output.name') || 'name',
        type: _.get(config, 'output.type') || 'type',
        id: _.get(config, 'output.id') || 'id',
    };

    for (let i = 0; i < config.dataObjects.length; i++) {

        let dataObjects = [];
        let dataObject = {};

        if (config.dataObjects[i] === '') dataObject = data;
        else if (Array.isArray(config.dataObjects[i])) {
            const arrays = [];
            for (let n = 0; n < config.dataObjects[i].length; n++) {
                arrays.push(_.get(data, config.dataObjects[i][n]));
            }
            dataObject = mapArrays(arrays);
        } else dataObject = _.get(data, config.dataObjects[i]);

        if (!Array.isArray(dataObject)) dataObjects.push(dataObject);
        else dataObjects = dataObject;

        for (let j = 0; j < dataObjects.length; j++) {
            if (dataObjects[j] === undefined) {
                continue;
            }

            // Look for hardwareId.
            let hardwareId = getValueFromResponse(config.generalConfig, path, dataObjects[j], 'hardwareId');

            // Look for source name.
            let name = getValueFromResponse(config.generalConfig, path, dataObjects[j], 'sourceName');

            // Look for timestamp.
            let timestamp = getValueFromResponse(config.generalConfig, path, dataObjects[j], 'timestamp');
            if (!timestamp) timestamp = new Date();

            // Map data from the response data.
            const measurement = {
                timestamp: new Date(timestamp),
                data: {},
            };

            // Sometimes a timestamp in seconds is encountered and needs to be converted to millis.
            if (measurement.timestamp.getFullYear() === 1970) {
                measurement.timestamp = new Date(timestamp * 1000);
            }

            // Convert timestamp to ISO-format.
            measurement.timestamp = measurement.timestamp.toISOString();

            // Map data.
            _.forIn(config.dataPropertyMappings, function (value, key) {
                if (config.dataPropertyMappings[key] === '') {
                    measurement.data[key] = dataObjects[j];
                } else {
                    if (_.get(dataObjects[j], value) !== undefined && _.get(dataObjects[j], value) !== null) {
                        measurement.data[key] = _.get(dataObjects[j], value);
                    }
                }
            });

            // Execute data plugin function.
            for (let i = 0; i < config.plugins.length; i++) {
                if (config.plugins[i].data) {
                    measurement.data = await config.plugins[i].data(config, measurement.data);
                }
            }

            // Check for objects to be included to every measurement.
            if (config.generalConfig.include) {
                _.forIn(config.generalConfig.include, function (value, key) {
                    measurement.data[key] = value;
                });
            }

            // Skip to next resource if the data did not pass the parsing operation.
            if (Object.keys(measurement.data).length === 0) continue;
            let idObjects = [];
            let dataType;

            if (config.generalConfig.skipSpecificResponseParsing) {
                measurements.push(measurement.data);
                continue;
            }

            try {
                // Use parameter id as fallback.
                idObjects =
                    _.get(config, 'parameters.ids') ||
                    _.get(config, 'parameters.targetObject') || [];
                if (!hardwareId) {
                    const ids = (Array.isArray(idObjects) ? idObjects : [idObjects])
                        .map(object => object.id || object.idLocal || object).flat();
                    hardwareId = ids[index] || index;
                }
            } catch (e) {
                hardwareId = index;
            }

            try {
                // Use type from id object.
                const match = idObjects.find(entry => (entry.id || entry.idLocal || entry) === hardwareId);
                if (Object.hasOwnProperty.call(match || {}, 'type')) {
                    dataType = match.type;
                }
            } catch (e) {
                dataType = null;
            }

            const item = {
                [keys.id]: hardwareId,
                [keys.name]: name,
                [keys.data]: [],
            };

            // Format data
            for (let d = 0; d < Object.entries(measurement.data).length; d++) {
                let type = dataType || Object.entries(measurement.data)[d][0];
                try {
                    // Select best match from array of types.
                    if (type.split(',').length > 1) {
                        const match = type.split(',').map(t => ({type: t, score: _.uniq(t.split('')
                            .filter(value => hardwareId.split('').includes(value.toUpperCase()))).length}))
                            .sort((a, b) => b.score - a.score);
                        type = match[0].type;
                    }
                } catch (err) {
                    console.log(err.message);
                }

                // Filter data types.
                if (Object.hasOwnProperty.call(config, 'parameters')) {
                    if (Object.hasOwnProperty.call(config.parameters, 'dataTypes')) {
                        let types = config.parameters.dataTypes;
                        types = Array.isArray(types) ? types : [types];
                        if (!types.includes(type) && types.length > 0) {
                            continue;
                        }
                    }
                }

                item[keys.data].push({
                    [keys.type]: type,
                    [keys.timestamp]: measurement.timestamp,
                    [keys.value]: Object.entries(measurement.data)[d][1],
                });
            }

            if (item[keys.data].length > 0) {
                measurements.push(item);
            }
        }
    }

    let mergedData = measurements;
    if (config.generalConfig.skipSpecificResponseParsing)
        return Promise.resolve(mergedData);

    // Merge measurements with same hardwareId to same data array (history).
    try {
        const merged = {};
        for (let i = 0; i < measurements.length; i++) {
            if (!Object.hasOwnProperty.call(merged, measurements[i][keys.id])) {
                merged[measurements[i][keys.id]] =  measurements[i];
            } else {
                merged[measurements[i][keys.id]][keys.data]
                    = [...measurements[i][keys.data], ...merged[measurements[i][keys.id]][keys.data]];
            }
        }
        mergedData = Object.values(merged);

        // Sort data arrays.
        for (let j = 0; j < mergedData.length; j++) {
            mergedData[j][keys.data] =
                mergedData[j][keys.data]
                    .sort((a, b) => a[keys.timestamp] - b[keys.timestamp]);

            // Execute id plugin function.
            for (let i = 0; i < config.plugins.length; i++) {
                if (config.plugins[i].id) {
                    mergedData[j][keys.id] = await config.plugins[i].id({...config, index}, mergedData[j][keys.id]);
                }
            }

        }
    } catch (err) {
        winston.log('error', 'Failed to merge data. ' + err.message);
    }

    return Promise.resolve(mergedData);
};

/**
 * Expose library functions.
 */
module.exports = {
    handleData,
};
