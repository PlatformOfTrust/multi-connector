'use strict';
/**
 * Module dependencies.
 */
const NodeCache = require('node-cache');

/**
 * Cache.
 *
 * Handles caching operations.
 */
const defaultTTL = 86400; // 24h

// Initialize cache object.
const cache = {
    codes: {cache: new NodeCache()},
    grants: {cache: new NodeCache()},
    configs: {cache: new NodeCache()},
    messages: {cache: new NodeCache()},
    templates: {cache: new NodeCache()},
    resources: {cache: new NodeCache()},
    publicKeys: {cache: new NodeCache()},
    dataProducts: {cache: new NodeCache()},
};

/**
 * Reads a document.
 *
 * @param {String} collection
 * @param {String} id
 * @return {String}
 */
const getDoc = function (collection, id) {
    if (Object.hasOwnProperty.call(cache, collection) && !!id) return cache[collection].cache.get(id.toString());
    else return undefined;
};

/**
 * Reads documents by collection.
 *
 * @param {String} collection
 * @return {Array}
 */
const getDocs = function (collection) {
    if (Object.hasOwnProperty.call(cache, collection)) {
        const array = [];
        const keys = cache[collection].cache.keys();
        for (let j = 0; j < keys.length; j++) {
            array.push(cache[collection].cache.get(keys[j]));
        }
        return array;
    } else return [];
};

/**
 * Reads keys by collection.
 *
 * @param {String} collection
 * @return {Array}
 */
const getKeys = function (collection) {
    if (Object.hasOwnProperty.call(cache, collection)) {
        return cache[collection].cache.keys();
    } else return [];
};

/**
 * Writes a document to a collection.
 *
 * @param {String} collection
 * @param {String} id
 * @param {Object/Array/String} doc
 * @param {Number} [TTL]
 */
const setDoc = function (collection, id, doc, TTL = defaultTTL) {
    doc = JSON.parse(JSON.stringify(doc));
    if (!Object.hasOwnProperty.call(cache, collection)) cache[collection] = {cache: new NodeCache(), TTL};
    if (cache[collection].TTL) {
        if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.set(id, doc, cache[collection].TTL);
    } else {
        if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.set(id, doc);
    }
};

/**
 * Deletes a document in a collection.
 *
 * @param {String} collection
 * @param {String} id
 */
const delDoc = function (collection, id) {
    if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.del(id.toString());
};

/**
 * Expose methods.
 */
module.exports = {
    getDoc,
    getDocs,
    getKeys,
    setDoc,
    delDoc,
};
