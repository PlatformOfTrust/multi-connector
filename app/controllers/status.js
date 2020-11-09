'use strict';
/**
 * Status controller.
 *
 * Mainly used for health check endpoints, but can also add
 * more status endpoints to the API.
 */

/**
 * Returns 200 OK with empty object.
 * Used for health checks.
 *
 * @param {Object} req
 * @param {Object} res
 * @return
 *   Empty response.
 */
module.exports.healthCheck = function (req, res) {
    res.status(200).send({});
};
