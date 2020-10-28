"use strict";
/**
 * Module dependencies.
 */
const _ = require("lodash");
const crypto = require("crypto");
const cache = require("../cache");
const request = require("request");
const winston = require("../../logger.js");

/**
 * RSA library.
 *
 * Handles key generation, signing, verifying and public key providing.
 */

/** Platform of Trust related definitions. */
const {
    defaultKeySize,
    publicKeyURLs,
} = require("../../config/definitions/pot");

/** Optional environment variables. */
let privateKey = process.env.PRIVATE_KEY;
let publicKey = process.env.PUBLIC_KEY;

if (!privateKey || !publicKey) {
    // If RSA keys are not provided by environment variables,
    // they are generated on load with the default key size.

    crypto.generateKeyPair(
        "rsa",
        {
            modulusLength: defaultKeySize,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        },
        (err, pubKey, privKey) => {
            if (!err) {
                privateKey = privKey;
                publicKey = pubKey;
                winston.log("info", "Generated RSA keys.");
            } else {
                winston.log("error", err.message);
            }
        }
    );
}

/**
 * Reads public keys from Platform of Trust resources.
 */
const readPublicKeys = function() {
    for (let i = 0; i < publicKeyURLs.length; i++) {
        request(publicKeyURLs[i].url, function(err, response, body) {
            if (err) {
                winston.log("error", err.message);
            } else {
                cache.setDoc("publicKeys", i, {
                    priority: i,
                    ...publicKeyURLs[i],
                    key: body.toString(),
                });
            }
        });
    }
};

// Initiate public keys reading.
readPublicKeys();

/**
 * Sends public key response.
 *
 * @param {Object} req
 * @param {Object} res
 */
const sendPublicKey = function(req, res) {
    res.setHeader("Content-type", "application/octet-stream");
    res.setHeader("Content-disposition", "attachment; filename=public.key");
    res.send(publicKey);
};

/**
 * Sorts object recursively.
 *
 * @param {Object} object
 * @return {Object}
 *   Sorted object.
 */
const sortObject = function(object) {
    let sortedObj = {};

    Object.keys(object)
        .sort()
        .forEach(key => {
            if (
                object[key] instanceof Array ||
                typeof object[key] !== "object"
            ) {
                sortedObj[key] = object[key];
                return;
            }
            sortedObj[key] = sortObjectAlt(object[key]);
            return;
        }, {});

    return sortedObj;
};

/**
 * Stringifies body object.
 *
 * @param {Object} body
 * @return {String}
 *   Stringified body.
 */
const stringifyBody = function(body) {
    // Stringify sorted object.
    return JSON.stringify(sortObject(body))
        .replace(
            /[\u007F-\uFFFF]/g,
            chr => "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
        )
        .replace(new RegExp('":', "g"), '": ')
        .trim();
};

/**
 * Generates signature object for given payload.
 *
 * @param {Object} body
 *   The payload to sign.
 * @param {String} [key]
 *   Private key used for signing.
 * @return {String}
 *   The signature value.
 */
const generateSignature = function(body, key) {
    // Use local private key, if not given.
    if (!key) key = privateKey;

    // Initialize signature value.
    let signatureValue;

    // Create SHA256 signature in base64 encoded format.
    try {
        signatureValue = crypto
            .createSign("sha256")
            .update(stringifyBody(body))
            .sign(key.toString(), "base64");
    } catch (err) {
        winston.log("error", err.message);
    }

    return signatureValue;
};

/**
 * Validates signature for given payload.
 *
 * @param {Object} body
 *   Payload to validate.
 * @param {String} signature
 *   Signature to validate.
 * @param {String/Object} [key]
 *   Public key used for validation.
 * @return {Boolean}
 *   True if signature is valid, false otherwise.
 */
const verifySignature = function(body, signature, key) {
    // Use local public key, if not given.
    if (!key) key = publicKey;

    // Initialize verifier.
    const verifier = crypto.createVerify("sha256");

    // Update verifier.
    verifier.update(stringifyBody(body));

    // Verify base64 encoded SHA256 signature.
    return verifier.verify(key, signature, "base64");
};

/**
 * Expose library functions.
 */
module.exports = {
    generateSignature,
    verifySignature,
    sendPublicKey,
};
