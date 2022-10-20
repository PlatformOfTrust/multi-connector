'use strict';
const crypto = require('crypto');

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

/**
 * Expose library functions.
 */
module.exports = {
    replaceAll,
    replacer,
    encrypt,
    decrypt,
};
