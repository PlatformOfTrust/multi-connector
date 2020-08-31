"use strict";
/**
 * Module dependencies.
 */
const gtfs = require('gtfs-realtime-bindings');

/**
 * Parses binary GTFS-realtime data feed into JavaScript objects.
 */

/** Import platform of trust request definitions. */
const {PARAMETERS, IDS} = require('../../config/definitions/request');

/**
 * Parses response as a FeedMessage (root type of the GTFS-realtime schema).
 *
 * @param {Object} config
 * @param {Object} response
 * @return {Object}
 */
const response = async (config, response) => {
    try {
        // Parse response.
        response = gtfs.transit_realtime.FeedMessage.decode(response.body);
        // Pick requested ids from request parameters.
        const ids = Object.hasOwnProperty.call(config[PARAMETERS], IDS) ? config[PARAMETERS][IDS].map(o => o.id.toString()) : []
        // Filter out only requested entities.
        return response.entity.filter(e => ids.length === 0 || ids.includes(e.id.toString()));
    } catch (e) {
        return response;
    }
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'gtfs-realtime',
    response
};
