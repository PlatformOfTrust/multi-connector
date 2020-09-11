"use strict";
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
let cache = {
    grants: {cache: new NodeCache()},
    configs: {cache: new NodeCache()},
    messages: {cache: new NodeCache()},
    templates: {cache: new NodeCache()},
    resources: {cache: new NodeCache()},
    publicKeys: {cache: new NodeCache()},
    dataProducts: {cache: new NodeCache()}
};

const getDoc = function (collection, id) {
    if (cache.hasOwnProperty(collection)) return cache[collection].cache.get(id.toString());
    else return undefined;
};

const getDocs = function (collection) {
    if (Object.hasOwnProperty.call(cache, collection)) {
        let array = [];
        let keys = cache[collection].cache.keys();
        for (let j = 0; j < keys.length; j++) {
            array.push(cache[collection].cache.get(keys[j]));
        }
        return array;
    } else return [];
};

const getKeys = function (collection) {
    if (Object.hasOwnProperty.call(cache, collection)) {
        return cache[collection].cache.keys();
    } else return {};
};

const setDoc = function (collection, id, doc) {
    doc = JSON.parse(JSON.stringify(doc));
    if (!Object.hasOwnProperty.call(cache, collection)) cache[collection] = {cache: new NodeCache(), TTL: defaultTTL};
    if (cache[collection].TTL) {
        if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.set(id, doc, cache[collection].TTL);
    } else {
        if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.set(id, doc);
    }
};

const delDoc = function (collection, id) {
    if (Object.hasOwnProperty.call(cache, collection)) cache[collection].cache.del(id.toString());
};

module.exports = {
    getDoc,
    getDocs,
    getKeys,
    setDoc,
    delDoc
};
