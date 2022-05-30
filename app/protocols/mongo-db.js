'use strict';
/**
 * Module dependencies.
 */
 const { MongoClient } = require('mongodb');
 const _ = require('lodash');

 const getData = async (config, pathArray) => {
    const mongoCN = config.authConfig.url;
    const client = new MongoClient(mongoCN, { tlsAllowInvalidCertificates: true });
    const dbName = config.authConfig.dbName;

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(config.authConfig.dbCollection);

   return await collection.find(config.dbFilter).toArray();
 }

 const pushData = async (config, pathArray) => {
    const mongoCN = config.authConfig.url;
    const client = new MongoClient(mongoCN, {tlsAllowInvalidCertificates: true});
    const dbName = config.authConfig.dbName;

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(config.authConfig.dbCollection);
    const inputSource = config.input.source;
    const input = _.get(config, inputSource);
    collection.insertMany(input);

    return input;
 }

 /**
 * Expose library functions.
 */
module.exports = {
    getData,
    pushData,
};
