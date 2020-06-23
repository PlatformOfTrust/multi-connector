"use strict";
/**
 * Platform of Trust definitions.
 */

/** Default RSA key size for generated keys. */
const defaultKeySize = 4096;

/** URLs of Platform of Trust public keys. */
const publicKeyURLs = [
    {
        env: 'production',
        url: 'https://static.oftrust.net/keys/translator.pub'
    },
    {
        env: 'sandbox',
        url: 'https://static-sandbox.oftrust.net/keys/translator.pub'
    },
    {
        env: 'staging',
        url: 'https://static-staging.oftrust.net/keys/translator.pub'
    },
    {
        env: 'test',
        url: 'https://static-test.oftrust.net/keys/translator.pub'
    }
];

/**
 * Expose definitions.
 */
module.exports = {
    defaultKeySize,
    publicKeyURLs
};
