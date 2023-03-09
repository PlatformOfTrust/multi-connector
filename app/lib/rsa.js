'use strict';
/**
 * Module dependencies.
 */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cache = require('../cache');
const {replaceAll} = require('../lib/utils');
const rp = require('request-promise');
const winston = require('../../logger.js');

/**
 * RSA library.
 *
 * Handles key generation, signing, verifying and public key providing.
 */

/** Platform of Trust related definitions. */
const {
    defaultKeySize,
    publicKeyURLs,
} = require('../../config/definitions/pot');

/** Optional environment variables. */
let privateKey = process.env.PRIVATE_KEY.toString().replace(/\\\n/g, '\n');
let publicKey = process.env.PUBLIC_KEY.toString().replace(/\\\n/g, '\n');

if (!privateKey || !publicKey) {
    // If RSA keys are not provided by environment variables,
    // they are generated on load with the default key size.

    crypto.generateKeyPair('rsa', {
        modulusLength: defaultKeySize,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    }, (err, pubKey, privKey) => {
        if (!err) {
            privateKey = privKey;
            publicKey = pubKey;
            winston.log('info', 'Generated RSA keys.');
        } else {
            winston.log('error', err.message);
        }
    });
}

/**
 * Reads public keys from Platform of Trust resources.
 */
const readPublicKeys = async () => {
    for (let i = 0; i < publicKeyURLs.length; i++) {
        try {
            const body = await rp({method: 'GET', url: publicKeyURLs[i].url});
            if (body) {
                cache.setDoc('publicKeys', i, {
                    priority: i,
                    ...publicKeyURLs[i],
                    key: replaceAll(body.toString(), '\\n', '\n'),
                }, 0);
            }
        } catch (err) {
            winston.log('error', err.message);
            if (Object.hasOwnProperty.call(publicKeyURLs[i], 'key')) {
                cache.setDoc('publicKeys', i, {
                    priority: i,
                    ...publicKeyURLs[i],
                }, 0);
            }
        }
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
const sendPublicKey = function (req, res) {
    res.setHeader('Content-type', 'application/octet-stream');
    res.setHeader('Content-disposition', 'attachment; filename=public.key');
    res.send(publicKey);
};

/**
 * Returns current public key.
 *
 * @return {String}
 *   Public key.
 */
const getPublicKey = function () {
    return publicKey;
};

/**
 * Sorts object recursively.
 *
 * @param {Object} object
 * @return {Object}
 *   Sorted object.
 */
const sortObject = function (object) {
    if (object instanceof Array || typeof object !== 'object' || object === null) {
        if (object instanceof Array) {
            return object.map(o => sortObject(o));
        } else {
            return object;
        }
    }

    const sortedObj = {};
    Object.keys(object)
        .sort()
        .forEach(key => {
            sortedObj[key] = sortObject(object[key]);
        }, {});

    return sortedObj;
};

/**
 * Stringifies object leaving spaces between keys and values.
 *
 * @param {Object} object
 * @return {String}
 *   Stringified object.
 */
const stringifyWithSpaces = (object) => {
    // Stringify with line-breaks and indents.
    let result = JSON.stringify(object, null, 1) || '';
    // Remove all but the first space for each line.
    result = result.replace(/^ +/gm, '');
    // Remove line-breaks.
    result = result.replace(/\n/g, '');
    return result;
};

/**
 * Stringifies body object.
 *
 * @param {Object} body
 * @param {Boolean} [sort]
 * @return {String}
 *   Stringified body.
 */
const stringifyBody = function (body, sort = true) {
    // Stringify sorted object.
    return stringifyWithSpaces(sort ? sortObject(body) : body).replace(/[\u007F-\uFFFF]/g, chr => '\\u' + ('0000' + chr.charCodeAt(0)
        .toString(16)).substr(-4));
};

/**
 * Generates signature for given payload.
 *
 * @param {Object/String} body
 *   The payload to sign.
 * @param {String} [key]
 *   Private key used for signing.
 * @param {Boolean} [sort]
 *   Sort body.
 *  @param {String} [type]
 *   Signature, HMAC or JWT.
 *  @param {String} [algorithm]
 *   Algorithm used for signing.
 *  @param {String} [encoding]
 *   Algorithm used for signing.
 * @return {String}
 *   The signature value.
 */
const generateSignature = function (body, key, sort = true, type = 'rsa', algorithm = 'sha256', encoding = 'base64') {
    // Use local private key, if not given.
    if (!key) { key = privateKey; }

    // Initialize signature value.
    let signatureValue;

    try {
        const data = typeof body === 'string' && type !== 'jwt' ? body : (sort ? stringifyBody(body) : replaceAll(JSON.stringify(body), ' ', ''));
        switch (type) {
            /** Create a signature. */
            case 'rsa':
                signatureValue = crypto.createSign(algorithm).update(data).sign(key.toString(), encoding);
                break;
            /** Create a hash. */
            case 'hmac':
                signatureValue = crypto.createHmac(algorithm, key).update(data).digest(encoding);
                break;
            /** Create a token. */
            case 'jwt':
                signatureValue = jwt.sign(data, key, key === privateKey ? {algorithm: 'RS256'} : {});
                break;
        }
    } catch (err) {
        winston.log('error', err.message);
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
 * @param {Boolean} [sort]
 *   Sort body.
 *  @param {String} [type]
 *   Signature, HMAC or JWT.
 *  @param {String} [algorithm]
 *   Algorithm used for signing.
 *  @param {String} [encoding]
 *   Algorithm used for signing.
 * @return {Boolean}
 *   True if signature is valid, false otherwise.
 */
const verifySignature = function (body, signature, key, sort = true, type = 'rsa', algorithm = 'sha256', encoding = 'base64') {
    // Use local public key, if not given.
    if (!key) key = publicKey;

    // Initialize verification result.
    let verificationResult = false;

    const data = typeof body === 'string' && type !== 'jwt' ? body : (sort ? stringifyBody(body) : replaceAll(JSON.stringify(body), ' ', ''));
    let verifier;
    switch (type) {
        /** Verify signature. */
        case 'rsa':
            // Initialize verifier.
            verifier = crypto.createVerify(algorithm);

            // Update verifier.
            verifier.update(data);

            // Verify base64 encoded SHA256 signature.
            verificationResult = verifier.verify(key, signature, encoding);
            break;
        /** Verify hash. */
        case 'hmac':
            verificationResult = crypto.createHmac(algorithm, key).update(data).digest(encoding) === signature;
            break;
        /** Verify token. */
        case 'jwt':
            verificationResult = jwt.verify(signature, key, key === publicKey ? {algorithm: 'RS256'} : {}) === JSON.stringify(body);
            break;
    }

    return verificationResult;
};

/**
 * Encrypts string with given public key.
 *
 * @param {String} string
 *   The string to encrypt.
 * @param {String} [key]
 *   Public key.
 * @return {String}
 *   The encrypted string.
 */
const encrypt = function (string, key) {
    // Use local public key, if not given.
    if (!key) key = publicKey;
    return crypto.publicEncrypt(key, Buffer.from(string, 'utf8')).toString('base64');
};

/**
 * Decrypts string with given private key.
 *
 * @param {String} string
 *   The string to decrypt.
 * @param {String} [key]
 *   Private key.
 * @return {String}
 *   The decrypted string.
 */
const decrypt = function (string, key) {
    // Use local private key, if not given.
    if (!key) key = privateKey;
    return crypto.privateDecrypt(key, Buffer.from(string, 'base64')).toString('utf8');
};

/**
 * Expose library functions.
 */
module.exports = {
    sortObject,
    stringifyBody,
    generateSignature,
    verifySignature,
    sendPublicKey,
    getPublicKey,
    encrypt,
    decrypt,
};
