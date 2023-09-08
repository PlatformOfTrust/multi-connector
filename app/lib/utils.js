'use strict';
const crypto = require('crypto');
const cache = require('../cache');
const winston = require('../../logger');

/**
 * Module dependencies.
 */
const _ = require('lodash');

/**
 * Utils library.
 *
 * Common functions.
 */

const algorithm = 'aes-256-cbc';

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
const replacer = function (template, placeholder, value) {
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

                // Convert idLocal to id in case placeholder is not found.
                if (key === 'idLocal' && !r.includes('${idLocal}') && r.includes('${id}')) {
                    r = replaceAll(r, '${id}', value[key]);
                }
            }
            // Reverse replace in case parse fails and use stringified value instead.
            try {
                JSON.parse(r);
            } catch (err) {
                r = replaceAll(r, JSON.stringify(value[key]), '"' + value[key] + '"');
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
};

/**
 * Encrypts given string value.
 *
 * @param {String} value
 * @param {String} key
 * @return {Object}
 */
const encrypt = (value = '', key) => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'base64'), iv);
        let encrypted = cipher.update(value);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {
            iv: iv.toString('hex'),
            encrypted: encrypted.toString('hex'),
        };
    } catch (err) {
        return undefined;
    }
};

/**
 * Decrypts given string value.
 *
 * @param {Object} value
 * @return {String}
 */
const decrypt = (value = {}) => {
    try {
        const iv = Buffer.from(value.iv, value.encoding || 'hex');
        const encrypted = Buffer.from(value.encrypted, value.encoding || 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(value.key, 'base64'), iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        return undefined;
    }
};

Date.prototype.stdTimezoneOffset = function () {
    const jan = new Date(this.getFullYear(), 0, 1);
    const jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};

/**
 * Converts date object which has finnish UTC(+2 OR +3) as UTC0 to valid date object and vice versa.
 *
 * @param {Date} input
 * @param {Boolean} [reverse]
 * @param {Boolean} [convert]
 * @return {String}
 */
const convertFinnishDateToISOString = (input, reverse = false, convert = false) => {
    // Examples.
    // Finnish UTC +2 or +3.
    // new Date(1610031289498); -2
    // new Date(1631092909080); -3 (Daylight Saving Time)
    let output;
    if (typeof input === 'string' && convert) {
        input = input.replace(' ', 'T');
    }
    input = convert ? new Date(input) : input;
    if (input.isDstObserved()) {
        output = new Date(input.setHours(input.getHours() - (reverse ? -3 : 3)));
    } else {
        output = new Date(input.setHours(input.getHours() - (reverse ? -2 : 2)));
    }
    return output.toISOString();
};

/**
 * Generates random UUIDv4.
 *
 * @return {String}
 */
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Waits for given time.
 *
 * @param {Number} ms
 * @param {Function} [callback]
 * @return {Promise}
 */
const wait = (ms, callback = () => undefined) => new Promise(resolve => setTimeout(() => resolve(callback()), ms));

/**
 * Returns next free port by product code.
 *
 * @param {String} [id]
 * @param {Object} [defaultPort]
 * @param {Object} [config]
 * @param {String} [productCode]
 * @return {Number}
 */
const getPort = (id, defaultPort = null, config, productCode) => {
    let port;
    const ports = cache.getKeysAndDocs('ports');
    const usedPorts = Object.values(ports);
    if (productCode) {
        if (Object.hasOwnProperty.call(ports, productCode)) {
            return ports[productCode];
        }
    }
    if (!defaultPort) {
        return null;
    }
    try {
        let next = defaultPort;
        while (!port) {
            if (!usedPorts.includes(next)) {
                port = next;
            } else {
                next++;
            }
        }
        if (Object.hasOwnProperty.call(config.plugins[id], 'port')) {
            const configuredPort = Number.parseInt(config.plugins[id].port);
            if (!usedPorts.includes(configuredPort) && configuredPort !== 0) {
                port = configuredPort;
            }
        }
    } catch (err) {
        winston.log('error', err.message);
    }
    return port;
};

/**
 * Sets or deletes port by product code.
 *
 * @param {String} productCode
 * @param {Number} [port]
 */
const setPort = (productCode, port) => {
    if (port === undefined || port === null) {
        cache.delDoc('ports', productCode);
    } else {
        cache.setDoc('ports', productCode, port, 0);
    }
};

/**
 * Expose library functions.
 */
module.exports = {
    uuidv4,
    replaceAll,
    replacer,
    encrypt,
    decrypt,
    convertFinnishDateToISOString,
    wait,
    getPort,
    setPort,
};
