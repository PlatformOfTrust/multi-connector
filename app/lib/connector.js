'use strict';
/**
 * Module dependencies.
 */
const winston = require('../../logger.js');
const rest = require('../protocols/rest');
const validator = require('./validator');
const events = require('events');
const cache = require('../cache');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');

/**
 * Connector library.
 *
 * Handles data fetching by product code specific configurations.
 */

/** Import platform of trust request definitions. */
const {
    PRODUCT_CODE,
    TIMESTAMP,
    PARAMETERS,
    IDS,
    START,
    END,
    DATA_TYPES,
    supportedParameters,
} = require('../../config/definitions/request');

/** Import platform of trust response definitions. */
const {
    defaultOutput,
} = require('../../config/definitions/response');

// Initialize objects for protocols and plugins.
const protocols = {};
const plugins = {};

// Set directories.
const templatesDir = './config/templates';
const resourcesDir = './config/resources';
const protocolsDir = './app/protocols';
const pluginsDir = './config/plugins';
const configsDir = './config';

// Make sure directories for templates, protocols, configs and plugins exists.
if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir);
if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir);
if (!fs.existsSync(protocolsDir)) fs.mkdirSync(protocolsDir);
if (!fs.existsSync(configsDir)) fs.mkdirSync(configsDir);
if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

/**
 * Handles JSON data.
 *
 * @param {String} collection
 * @param {Object} file
 * @param {String} data
 */
function handleFile (collection, file, data) {
    let object;
    try {
        object = JSON.parse(data);
        // If config has protocol mqtt or websocket, connect to the broker/server.
        if (Object.hasOwnProperty.call(object, 'static')) {
            if (Object.hasOwnProperty.call(object.static, 'topic')) {
                protocols['mqtt'].connect(object, file);
            }
            if (Object.hasOwnProperty.call(object.static, 'event')) {
                protocols['websocket'].connect(object, file);
            }
        }
    } catch (err) {
        /** File is not a valid JSON. */
    }
    cache.setDoc(collection, file, object || data);
}

/**
 * Caches or requires file contents.
 *
 * @param {String} dir
 * @param {String} ext
 * @param {String} collection
 * @param {Object} file
 */
function readFile (dir, ext, collection, file) {
    return new Promise(function (resolve, reject) {
        fs.readFile(dir + '/' + file, 'utf8', function (err, data) {
            if (err) return winston.log('error', 'File read error', err.message);
            try {
                switch (ext) {
                    /** JSON. */
                    case '.json':
                        handleFile(collection, file.split('.')[0], data);
                        break;
                    /** JavaScript. */
                    case '.js':
                        eval(collection)[file.split('.')[0]] = require('../.' + dir + '/' + file);
                        break;
                    /** Resources. */
                    case '.*':
                        handleFile(collection, file, data);
                        break;
                }
                winston.log('info', 'Loaded ' + dir + '/' + file + '.');
            } catch (err) {
                winston.log('error', err.message);
            }
            resolve();
        });
    });
}

/**
 * Scans directory and handles files.
 *
 * @param {String} dir
 *   Directory to be scanned.
 * @param {String} ext
 *   Extension of the files to be scanned.
 * @param {String} collection
 *   Collection name.
 *  @param {Function} callback
 *   Handler for single file.
 */
function load (dir, ext, collection, callback) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, async (err, files) => {
            if (err) reject(err);
            for (let i = 0; i < files.length; i++) {
                // Handle only files with given file extension.
                if (files[i].substr(-ext.length) !== ext && ext !== '.*') continue;
                await callback(dir, ext, collection, files[i]);
            }
            resolve();
        });
    });
}

// Emitter for loading status.
const emitter = new events.EventEmitter();

/**
 * Loads JSON files from array.
 *
 * @param {String} collection
 *   Type of the contents.
 * @param {String} string
 *   Content of the environment variable.
 */
function loadJSON (collection, string) {
    try {
        const object = JSON.parse(Buffer.from(string, 'base64').toString('utf8'));
        for (let i = 0; i < Object.keys(object).length; i++) {
            const filename = Object.keys(object)[i];
            handleFile(collection, filename, collection === 'resources' ? Buffer.from(object[filename], 'base64').toString('utf8') : JSON.stringify(object[filename]));
            winston.log('info', 'Loaded from environment ' + collection + '/' + filename + '.');
        }
    } catch (err) {
        winston.log('error', err.message);
    }
    return Promise.resolve();
}

/**
 * Emits cached collections.
 *
 * @param {Array} collections
 *   Collection names.
 */
function emit (collections) {
    const data = {};
    for (let i = 0; i < collections.length; i++) {
        try {
            data[collections[i]] = Object.assign({},
                ...cache.getKeys(collections[i]).map(key => {
                    return {[key]: cache.getDoc(collections[i], key)};
                }),
            );
        } catch (err) {
            winston.log('error', err.message);
        }
    }
    emitter.emit('collections', data);
    return Promise.resolve();
}

// Load templates, protocols, configurations and plugins.
(process.env.TEMPLATES ?
    /** Source selection for templates. */
    loadJSON('templates', process.env.TEMPLATES) :
    load(templatesDir, '.json', 'templates', readFile))
    .then(() => {
        return (process.env.RESOURCES ?
            /** Source selection for resources. */
            loadJSON('resources', process.env.RESOURCES) :
            load(resourcesDir, '.*', 'resources', readFile));
    })
    .then(() => {
        return load(protocolsDir, '.js', 'protocols', readFile);
    })
    .then(() => {
        return (process.env.CONFIGS ?
            /** Source selection for configs. */
            loadJSON('configs', process.env.CONFIGS) :
            load(configsDir, '.json', 'configs', readFile));
    })
    .then(() => {
        return load(pluginsDir, '.js', 'plugins', readFile);
    })
    .then(() => {
        emitter.emit('plugins', plugins);
        return emit(['templates', 'configs', 'resources']);
    })
    .catch((err) => winston.log('error', err.message));

/**
 * Escapes special (meta) characters.
 *
 * @param {String} string
 * @return {String}
 */
function escapeRegExp (string) {
    // $& means the whole matched string.
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replaces all occurrences with regular expression.
 *
 * @param {String} str
 * @param {String} find
 * @param {String} replace
 * @return {String}
 */
function replaceAll (str, find, replace) {
    // Handle undefined string.
    if (str === undefined) return undefined;
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/**
 * Replaces placeholder/s with given value/s.
 *
 * @param {String/Object} template
 *   Template value.
 * @param {String} placeholder
 *   Placeholder name. Used when value is not an object.
 * @param {String/Object} value
 *   Inserted value.
 * @return {String/Object}
 *   Template value with placeholder values.
 */
function replacer (template, placeholder, value) {
    let r = JSON.stringify(template);
    // Handle missing template.
    if (r === undefined) return undefined;
    // Convert all dates to strings.
    if (value instanceof Date) value = value.toISOString();
    if (_.isObject(value)) {
        Object.keys(value).forEach(function (key) {
            if (_.isObject(value[key])) {
                r = replaceAll(r, '"${' + key + '}"', JSON.stringify(value[key]));
            } else {
                r = replaceAll(r, '${' + key + '}', value[key]);
            }
        });
        // In case id placeholder is left untouched.
        if (r === '"${id}"' && Object.keys(value).length > 0) {
            // Place object to the id placeholder.
            r = replaceAll(r, '"${id}"', JSON.stringify(value));
        }
        // In case placeholder is for the whole object.
        if (r === '"${' + placeholder + '}"') {
            r = replaceAll(r, '"${' + placeholder + '}"', JSON.stringify(value));
        }
        return JSON.parse(r);
    } else {
        // Handle undefined placeholders.
        if (value === undefined && r === '"${' + placeholder + '}"') return undefined;
        return JSON.parse(replaceAll(r, '${' + placeholder + '}', value));
    }
}

/**
 * Configures template with data product config (static)
 * and request parameters (dynamic).
 *
 * @param {Object} config
 *   Data product specific config.
 * @param {Object} template
 *   Connection template for external system.
 * @param {Object} params
 *   Parameters from broker API request.
 * @return {Object}
 *   Configured template.
 */
function replacePlaceholders (config, template, params) {
    // In case dynamic parameter object ´ids´ does not contain objects,
    // these elements will be converted from [x, y, ...] to [{id: x}, {id: y}, ...].
    // This will ease the following dynamic placeholder procedure.
    if (Object.hasOwnProperty.call(params, 'ids')) {
        for (let i = 0; i < params.ids.length; i++) {
            if (!_.isObject(params.ids[i])) {
                params.ids[i] = {id: params.ids[i]};
            }
        }
    }

    /** Dynamic parameters. */
    if (Object.hasOwnProperty.call(config, 'dynamic')) {
        Object.keys(config.dynamic).forEach(function (path) {
            let placeholders = config.dynamic[path];
            if (!Array.isArray(placeholders)) {
                placeholders = [placeholders];
            }
            placeholders.forEach(function (placeholder) {
                const templateValue = _.get(template, path);
                if (templateValue) {
                    if (Array.isArray(_.get(params, placeholder))) {
                        // Transform placeholder to array, if given parameters are in an array.
                        const array = [];
                        _.get(params, placeholder).forEach(function (element) {
                            array.push(replacer(templateValue, placeholder, element));
                        });
                        _.set(template, path, array);
                    } else {
                        // If not found at static parameters, replace placeholder with undefined.
                        if (_.get(params, placeholder) || !Object.keys(config.static).includes(placeholder)) {
                            _.set(template, path, replacer(templateValue, placeholder, _.get(params, placeholder)));
                        }
                    }
                }
            });
        });
    }

    /** Static parameters. */
    if (Object.hasOwnProperty.call(config, 'static')) {
        template = replacer(template, null, config.static);
    }

    return template;
}

/**
 * Parses timestamp to date object.
 *
 * @param {String/Number} timestamp
 * @return {Date/String/Number}
 */
const parseTs = function (timestamp) {
    if (!timestamp) return timestamp;
    try {
        let parsed = new Date(Date.parse(timestamp));
        if (parsed.toString() === 'Invalid Date' || parsed.toString() === 'Invalid date') {
            // Try parsing the timestamp to integer.
            timestamp = Number.parseInt(timestamp);
            parsed = new Date(timestamp);
        }
        // Sometimes a timestamp in seconds is encountered and it needs to be converted to millis.
        if (parsed.getFullYear() === 1970) parsed = new Date(timestamp * 1000);
        return parsed;
    } catch (err) {
        return timestamp;
    }
};

/**
 * Interprets mode (latest/history/prediction).
 *
 * @param {Object} config
 *   Data product specific config.
 * @param {Object} parameters
 *   Broker request parameters.
 * @return {Object}
 *   Config with mode.
 */
const interpretMode = function (config, parameters) {
    // Some systems require always start and end time and latest values cannot be queried otherwise.
    // Start and end times are set to match last 24 hours from given timestamp.
    // Limit property is used to include only latest values.
    const defaultTimeRange = 1000 * 60 * 60 * 24;

    // Latest by default.
    config.mode = 'latest';

    // Detect history request from start and end time.
    if (parameters.start && parameters.end) {
        // Sort timestamps to correct order.
        if (parameters.end < parameters.start) {
            const start = parameters.end;
            parameters.end = parameters.start;
            parameters.start = start;
        }
        config.mode = 'history';
    } else {
        // Include default range.
        parameters.start = new Date(config.timestamp.getTime() - defaultTimeRange);
    }

    // Detect prediction request from end time and client's current local time.
    if (new Date(parameters.end).getTime() > config.timestamp.getTime()) {
        config.mode = 'prediction';
    }

    if (config.mode === 'latest') {
        // Add limit query property, if it's required.
        if (Object.hasOwnProperty.call(config, 'generalConfig')) {
            if (Object.hasOwnProperty.call(config.generalConfig, 'query')) {
                if (!Object.hasOwnProperty.call(config.generalConfig.query, 'properties')) {
                    config.generalConfig.query.properties = [];
                }
                if (Object.hasOwnProperty.call(config.generalConfig.query, 'limit')) {
                    config.generalConfig.query.properties.push(config.generalConfig.query.limit);
                }
            }
        }
    }

    // Save parameters to config.
    config.parameters = parameters;

    return config;
};

/**
 * Resolves plugin names.
 *
 * @param {Object} template
 * @return {Object}
 *   Template with resolved plugins.
 */
const resolvePlugins = async (template) => {
    // Attach plugins.
    if (Object.hasOwnProperty.call(template, 'plugins')) {
        const found = Object.keys(plugins).filter(p => template.plugins.includes(p));
        const missing = template.plugins.filter(p => !found.includes(p));
        if (missing.length > 0) {
            return rest.promiseRejectWithError(500, 'Missing required plugins: ' + missing);
        }
        template.plugins = found.map(n => plugins[n]);
    } else {
        template.plugins = [];
    }
    return Promise.resolve(template);
};

/**
 * Consumes described resources.
 *
 * @param {Object} template
 * @param {Object/Array} [input]
 * @return {Object}
 *   Data object.
 */
const composeOutput = async (template, input) => {
    // Check that resource path is defined.
    if (!Object.hasOwnProperty.call(template.authConfig, 'path')) {
        return rest.promiseRejectWithError(500, 'Insufficient resource configurations.');
    }

    let pathArray = [];
    const path = template.authConfig.path;
    if (!Array.isArray(path)) pathArray.push(path);
    else pathArray = path;

    // Remove duplicates.
    pathArray = _.uniq(pathArray);

    // Initialize items array.
    let items = [];

    // Initialize output definitions.
    template.output = template.output || {};
    template.output = {
        contextValue: template.output.contextValue || defaultOutput.contextValue,
        context: template.output.context || defaultOutput.context,
        object: template.output.object || defaultOutput.object,
        array: template.output.array || defaultOutput.array,
        value: template.output.value || defaultOutput.value,
        type: template.output.type || defaultOutput.type,
        data: template.output.data || defaultOutput.data,
        id: template.output.id || defaultOutput.id,
    };

    // Check that a protocol is defined.
    if (!Object.hasOwnProperty.call(template, 'protocol')) {
        return rest.promiseRejectWithError(500, 'Connection protocol not defined.');
    } else {
        // Check that the protocol is supported.
        if (!Object.hasOwnProperty.call(protocols, template.protocol)) {
            return rest.promiseRejectWithError(500, 'Connection protocol ' + template.protocol + ' is not supported.');
        } else {
            items = input || await protocols[template.protocol].getData(template, pathArray);
            if (!items) items = [];
        }
    }

    // Set output key names.
    const CONTEXT = _.get(template, 'output.context');
    const OBJECT = _.get(template, 'output.object');
    const ARRAY = _.get(template, 'output.array');

    // Compose output payload.
    let output = {
        [CONTEXT]: _.get(template, 'output.contextValue'),
        [OBJECT]: {
            [ARRAY]: _.flatten(items),
        },
    };

    // Execute output plugin function.
    for (let i = 0; i < template.plugins.length; i++) {
        if (template.plugins[i].output) {
            output = await template.plugins[i].output(template, output);
        }
    }

    // Return output and payload key name separately for signing purposes.
    return Promise.resolve({
        output,
        payloadKey: OBJECT,
    });
};

/**
 * Loads config by requested product code and retrieves template defined in the config.
 * Places static and dynamic parameters to the template as described.
 *
 * @param {Object} req
 * @return {Object}
 *   Data object.
 */
const getData = async (req) => {
    const reqBody = req.body;

    /** Default request validation */
    let validation = validator.validate(reqBody, supportedParameters);
    if (Object.hasOwnProperty.call(validation, 'error')) {
        if (validation.error) return rest.promiseRejectWithError(422, validation.error);
    }

    // Pick requested product code.
    const productCode = _.get(reqBody, PRODUCT_CODE) || 'default';

    // Get data product config.
    let config = cache.getDoc('configs', productCode);
    if (!config) config = cache.getDoc('configs', 'default');
    if (!config) return rest.promiseRejectWithError(404, 'Data product config not found.');
    if (!Object.hasOwnProperty.call(config, 'template')) {
        return rest.promiseRejectWithError(404, 'Data product config template not defined.');
    }

    // Get data product config template.
    let template = cache.getDoc('templates', config.template);
    if (!template) return rest.promiseRejectWithError(404, 'Data product config template not found.');

    /* Custom requirements */
    let requiredParameters;

    // Check for required input request parameters from template.
    if (Object.hasOwnProperty.call(template, 'input')) {
        if (Object.hasOwnProperty.call(template.input, 'required')) {
            if (Array.isArray(template.input.required)) {
                requiredParameters = _.uniq(template.input.required).map((path) => {
                    return {[path.toString()]: {required: true}};
                }).reduce(function (r, c) {
                    return Object.assign(r, c);
                }, {});
            }
        }
    }

    // If required parameters are not defined in template. Set IDS parameter required by default.
    if (!requiredParameters) {
        requiredParameters = {[IDS]: {required: true}};
    }

    /** Validation of data product specific parameters */
    validation = validator.validate(reqBody, requiredParameters || {});
    if (Object.hasOwnProperty.call(validation, 'error')) {
        if (validation.error) return rest.promiseRejectWithError(422, validation.error);
    }

    // Pick supported parameters from reqBody.
    const timestamp = parseTs(_.get(reqBody, TIMESTAMP) || moment.now());
    let parameters = {
        ids: _.get(reqBody, _.get(template, 'input.ids') || IDS) || [],
        start: parseTs(_.get(reqBody, _.get(template, 'input.start') || START)),
        end: parseTs(_.get(reqBody, _.get(template, 'input.end') || END) || timestamp),
        dataTypes: _.uniq(_.get(reqBody, _.get(template, 'input.dataTypes') || DATA_TYPES) || []),
    };

    // Make sure ids is an array and remove duplicates.
    if (!Array.isArray(parameters.ids)) {
        parameters.ids = [parameters.ids];
    }
    parameters.ids = _.uniq(parameters.ids);

    // Leave unsupported parameters untouched.
    _.unset(reqBody, IDS);
    _.unset(reqBody, START);
    _.unset(reqBody, END);
    _.unset(reqBody, DATA_TYPES);
    parameters = {...parameters, ..._.get(reqBody, PARAMETERS) || {}};

    // Template identifies connector settings for multiple configs.
    // ProductCode identifies requested data product.
    template.authConfig.template = config.template;
    template.authConfig.productCode = productCode;
    template.productCode = productCode;
    config.productCode = productCode;

    // Store connector URL.
    template.authConfig.connectorURL = req.protocol + '://' + req.get('host');

    // Make sure plugins array exists.
    if (!Array.isArray(template.plugins)) {
        template.plugins = [];
    }

    // Execute parameters plugin function.
    for (let i = 0; i < template.plugins.length; i++) {
        if (Object.hasOwnProperty.call(plugins, template.plugins[i])) {
            if (plugins[template.plugins[i]].parameters) {
                parameters = await plugins[template.plugins[i]].parameters(config, parameters);
            }
        }
    }

    // Place values defined in config to template.
    template = replacePlaceholders(config, template, parameters);

    // Timestamp presents client's current local time.
    template.timestamp = parseTs(timestamp);

    // Interpret mode.
    template = interpretMode(template, parameters);

    // Check that authConfig exists.
    if (!Object.hasOwnProperty.call(template, 'authConfig')) {
        return rest.promiseRejectWithError(500, 'Insufficient authentication configurations.');
    }

    // Resolve plugins.
    template = await resolvePlugins(template);

    // Execute template plugin function.
    for (let i = 0; i < template.plugins.length; i++) {
        if (template.plugins[i].template) {
            template = await template.plugins[i].template(config, template);
        }
    }

    // Compose output payload.
    return Promise.resolve(composeOutput(template));
};

/**
 * Expose library functions.
 */
module.exports = {
    getData,
    resolvePlugins,
    composeOutput,
    emitter,
};
