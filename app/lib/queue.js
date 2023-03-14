'use strict';
const {uuidv4} = require('../lib/utils');

/**
 * Queueing library.
 *
 * Handles execution by queueing.
 */

const queues = {};
const INTERVAL = 100;

/**
 * Inserts callback to queue and waits for it to finish.
 *
 * @param {String} q
 * @param {Function} c
 * @param {Array} p
 * @return {Promise}
 */
const queue = (q, c, p) => {
    // Take a place in the queue.
    const id = uuidv4();
    if (!Object.hasOwnProperty.call(queues, q)) {
        queues[q] = [id];
    } else {
        queues[q].push(id);
    }
    return new Promise((resolve, reject) => {
        // Start waiting.
        const w = setInterval(async () => {
            if (queues[q][0] === id) {
                queues[q][0] = new Date().getTime();
                // Invoke callback.
                let r;
                let e;
                try {
                    r = await c(...p);
                } catch (err) {
                    e = err;
                }
                clearInterval(w);
                queues[q].shift();
                if (e) {
                    reject(e);
                } else {
                    resolve(r);
                }
            }
        }, INTERVAL);
    });
};

module.exports = {
    queue,
};
