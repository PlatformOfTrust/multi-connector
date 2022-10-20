'use strict';
/**
 * Platform of Trust definitions.
 */

/** Default RSA key size for generated keys. */
const defaultKeySize = 4096;

/** Base URLs of Platform of Trust environments. */
const baseURLs = {
    'production': 'https://api.oftrust.net',
    'sandbox': 'https://api-sandbox.oftrust.net',
    'staging': 'https://api-staging.oftrust.net',
    'test': 'https://api-test.oftrust.net',
    'dev': 'https://api-dev.oftrust.net',
};

/** URLs of Platform of Trust public keys. */
const publicKeyURLs = [
    {
        version: 'v2',
        env: 'production',
        url: `${baseURLs['production']}/products/v2/auth/public-key`,
        key: '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAysbSibVENBuOUaRQOgqY\n9XKoaqA0qHd583XGVqGIa0nfqwjBQHmzoTQcYKmsW4OQESRdWCgjVM0fAr8Zkec8\nEDvb0u1/DqbiJpuAVgTW6fqcK41yoDgLxaKysITiB22/bO1v4kWvpTEgioWMYvyV\nED3uwGoTottVl4BevAJZ77FvTFs+gbMjESRuHPTe4RyJ428C04op+S2IssVLcwi3\nT9QD4nPumT9UAr0nfXq3VrCZMb4HVrycoEr8NGI6kSWVZaZYZmTEGrweze965WZ+\nPCgA4xk4CBRVPLeMVQ+GTvjHFJQ/cO3T0VAXxbptBqilYQn/rrU82sUa4nffrQxi\nVrFIAGGsmMl7z7NBq7/j2gToD+HoXZMxkXlvGl8S81cYIP6KbEcMqXXUvOFYBN5S\nTVjQvelYi3SFhKhp+Gsow4dMZtU3honePz4HopjGQq41LAANjJDtLmeEMb/4IUO3\ngMcmaO/PYIwWj9HTU88bDG5PnGom7UoId1I7/48fNun+fXt21TtXgQFXEv/PGJX3\nJ01UTIFDcVpFHR9h/+h0yaIhx4ASrTTmAhnHTJFpTl99lPgvBKw7Wy9zUPi9+mZm\naDPigcL/6PH24Cver/PDMz4xS6Va6ciOak0NjOAF2M8UnWpMubZAqiKtR5ZX3Qnz\noQZKZdj6jcw0HJH9DFoOBRECAwEAAQ==\n-----END PUBLIC KEY-----',
    },
    {
        version: 'v2',
        env: 'sandbox',
        url: `${baseURLs['sandbox']}/products/v2/auth/public-key`,
        key: '-----BEGIN PUBLIC KEY-----\nMIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBtDK+yDt2WBifvkV8/RrPZ\n7o6uT7GXAXcdRTyY57SWGcM96ksDL6g4zoGB30xKoIYiNUMYbt7hAF0tvAj3KHlU\nNnc15lxRvHOkb803SStDh416evaWfQzqfhxWUlsizGTLV+X06OnUOb/dup5/9w+0\nXRIguxOJn+5BOizTO+srglFeW2qCmtHxjKDAOxMpw9g5RPCB8fdWEDSrb27Vu5pl\nXnb+Ivt9PNq7ro/lQ+TiCfLAxX3GghTqRlHah5OF/NZodfzil5f47PtSqYQ9pJpV\nUBZRAuAmVsXWxiagWau7GN+ywXEUs+M+ZEyvBMeO59FR+ijqmJZU0pS9CpbyDPuA\n0nKg0/3C7liK3k9DEJIv8DTQRymz/fYjctdK5J5Fi6/uIDSVofcO69BTMSYrNMkv\nqzPMAKzADjI3zcwCZ9rKoXmYmydiXr3S0yPLWLxP8sjeE12CDJf5AOwraEH74t6O\nSUUvwOaoh38KhnWcvxW8oLYOXlXdqSmQYNT16IdaMtuuxrdLPx9sw+sUw1K9cqjO\nVhgMvge2YW9qsE5sTKRcNXip6JReBfVBfw9nLayQN7LRnbJUqQXkT25rsIiGLwPz\n080u3laO9siDQ1tWZagWywGxUyUez+R2XpbKUan+gdXolOPtUuAty9gtEfmb4cRk\nUFv+RvS5YUe1CjGnpP+B/wIDAQAB\n-----END PUBLIC KEY-----',
    },
    {
        version: 'v2',
        env: 'test',
        url: `${baseURLs['test']}/products/v2/auth/public-key`,
        key: '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAlTAtFrrWOWryjs8Ki2l2\n/Nvt7dUB91BeLks5JWOty3TkH2x+1qrVEO8SGcAh79RzZVlKij8yh5e0u0nH5iAq\nOHz+dzMQOiHyZGV5rzfQGXHdHYhkwIqJcYkCf0nnUPSIbC1dwyC4rmw7oLe/N0i2\nL8K+bFYD3HjiFWy9B+RawvOlnbtOMidGMUEfL43z3PI/rJaGrkX3cKoV2L0kPOG+\nh8G82v16apOrl7uZceAoW34GF1/bTN85XGh1n6FLdhQFskO1fce5gxNusK1bfQ5B\nm4YGVSXqB4J7sAX1CHfmzzKrjmrRvh0LWuWHWa4/ZcLSMQ6G021t6uJFoYbGPOtC\nobMX+O2GBWaUKSqlvwiO+nw59AtpNuZmekl9E01A5hT3DU7IdYaBlA4CFUQrXdl1\nEupW8KhJtt8EXPgjFK0N52vZvd7k8IdUItf2By2YSIHATA/GfjNuu2Nnkk2WaNE1\nNPW85VF+wxQjwBu3P1fmzIhT2PXrjTTwps2pO2x00qL+rw0lxo96hahye2SqbGf2\n5F9kA18Y+bjn61YhwTKuwW1xDGINCmhIm2si3u3pJxpfYQRZB/0xML01SHMv760B\nO3rFeYk1c7lUK8om3O/hXilm1EW0L4p7YZ6aTsf8ucFPxHDVqvQpoR9qr1A3ZDZC\n1BB8eJ0h8djA+gEHD5PNwMECAwEAAQ==\n-----END PUBLIC KEY-----',
    },
    {
        version: 'v2',
        env: 'dev',
        url: `${baseURLs['dev']}/products/v2/auth/public-key`,
        key: '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAhdDCC//QEgc4P4K9Bu+X\nNY3p0iZ8MYG1V4DNayrryaIZd4AXyB00TzdiBRHu0OzGcnNKo9llPwo8/k5hBADe\nRaohJWT90NfW2ectMSzyilmBo9ypqyRjP5pOBxkxjuiQDLJqjXQLIDC9v2DBcD0J\nMcalOkgJXa1tQidV+8m7zTWWfGKJGN9O7EvqoaMPBrDwzB1z0L7AuqtOpPMPtPcD\nlpElJqc/aimXY4VsjyCeC/mfgMEot1RNOClgaxu94NpjkywO3mEw3bnL6vjGocOg\nBay0R6cP3ggUPf+TBEmAdYWoK7BQWw+bhIVZUcq6lHdCy6BWOyXrwmdMQ1K1qq2r\n+PDjEmsyJbWEzXy67LnsEd7AY3qOoG/LOHmQutM2hrPltdEAylRptkNxmCNJxulH\n6p4GNvDf1OxWO4/gyt1I8sLP9TZavIcuNCuWXAMWaONbJGfs319oa0V2PubNd5bk\n6BLvvbL3Sd2hzNCtwwadEAfGfMxd6VrnhygKSdwnygFQJqk3Nxf56L9F932lmcb6\n+9XkXfQX/sBzpzhGns4mCrSBucr9nXx52HXwiaxpvRPMRbyuLqh6vLjfgOMHE2Kw\n3K3vvGgI4b0FPhj5cjmQsA7SyslZj2XAvpQYQtbEAgmbaFi0GQuvxaO6deepM7hx\ni1q+VqwkbiEMT3oLkLsUodMCAwEAAQ==\n-----END PUBLIC KEY-----',
    },
    {
        version: 'v1',
        env: 'production',
        url: 'https://static.oftrust.net/keys/translator.pub',
    },
    {
        version: 'v1',
        env: 'sandbox',
        url: 'https://static-sandbox.oftrust.net/keys/translator.pub',
    },
    {
        version: 'v1',
        env: 'staging',
        url: 'https://static-staging.oftrust.net/keys/translator.pub',
    },
    {
        version: 'v1',
        env: 'test',
        url: 'https://static-test.oftrust.net/keys/translator.pub',
    },
];

/** URLs of Platform of Trust broker endpoints. */
const brokerURLs = [
    {
        version: 'v1',
        env: 'production',
        url: `${baseURLs['production']}/broker/v1/fetch-data-product`,
    },
    {
        version: 'v1',
        env: 'sandbox',
        url: `${baseURLs['sandbox']}/broker/v1/fetch-data-product`,
    },
    {
        version: 'v1',
        env: 'staging',
        url: `${baseURLs['staging']}/broker/v1/fetch-data-product`,
    },
    {
        version: 'v1',
        env: 'test',
        url: `${baseURLs['test']}/broker/v1/fetch-data-product`,
    },
    {
        version: 'v2',
        env: 'production',
        url: `${baseURLs['production']}/products/v2/:productCode/data`,
        credentialsUrl: `${baseURLs['production']}/products/v2/:productCode/auth-credentials/consume`,
    },
    {
        version: 'v2',
        env: 'sandbox',
        url: `${baseURLs['sandbox']}/products/v2/:productCode/data`,
        credentialsUrl: `${baseURLs['sandbox']}/products/v2/:productCode/auth-credentials/consume`,
    },
    {
        version: 'v2',
        env: 'test',
        url: `${baseURLs['test']}/products/v2/:productCode/data`,
        credentialsUrl: `${baseURLs['test']}/products/v2/:productCode/auth-credentials/consume`,
    },
    {
        version: 'v2',
        env: 'dev',
        url: `${baseURLs['dev']}/products/v2/:productCode/data`,
        credentialsUrl: `${baseURLs['dev']}/products/v2/:productCode/auth-credentials/consume`,
    },
];

/**
 * Expose definitions.
 */
module.exports = {
    defaultKeySize,
    publicKeyURLs,
    brokerURLs,
    baseURLs,
};
