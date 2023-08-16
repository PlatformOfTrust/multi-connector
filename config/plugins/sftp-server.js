'use strict';
/**
 * Module dependencies.
 */
const crypto = require('crypto');
const {promises} = require('fs');
const {timingSafeEqual} = require('crypto');
const SftpServer = require('../../app/lib/sftp-server');
const {getPrivateKey} = require('../../app/lib/rsa');
const winston = require('../../logger.js');

/**
 * SFTP Server.
 */

const {
    Server,
    utils: {
        sftp,
    },
} = require('ssh2');
const storagePath = process.env.STORAGE_PATH || './';
const DOWNLOAD_DIR = `${storagePath}temp/`;

/**
 * Creates directory structure recursively for a given file path.
 *
 * @param {String} filepath
 */
const checkDir = async (filepath) => {
    try {
        if (process.platform === 'win32') {
            filepath = filepath.replace(/\\/g, '/');
        }
        let dst = filepath.split('/');
        if (dst[dst.length - 1].includes('.')) {
            // Remove filename part.
            dst.pop();
        }
        dst = dst.join('/');
        await promises.access(dst).then(() => true).catch(async () => await promises.mkdir(dst, {recursive: true}));
    } catch (e) {
        console.log(e.message);
    }
};

function checkValue (input, allowed) {
    const autoReject = (input.length !== allowed.length);
    if (autoReject) {
        // Prevent leaking length information by always making a comparison with the
        // same input when lengths don't match what we expect ...
        allowed = input;
    }
    const isMatch = timingSafeEqual(input, allowed);
    return (!autoReject && isMatch);
}

/**
 * Starts SFTP server.
 *
 * @param {Object} config
 * @param {Object} options
 * @param {Function} _callback
 * @return {Object}
 */
const connect = async (config, options, _callback) => {
    let server;
    try {
        const allowedUser = Buffer.from(options.username);
        const allowedPassword = Buffer.from(options.password);
        const basePath = DOWNLOAD_DIR + options.productCode + (options.fromPath || '');
        await checkDir(basePath);

        if (!options.privateKey) {
            // Use private key from env.
            const privateKeyObject = crypto.createPrivateKey({format: 'pem', key: getPrivateKey(), type: 'pkcs8'});
            options.privateKey = Buffer.from(privateKeyObject.export({format: 'pem', type: 'pkcs1'})).toString('base64');
        }

        server = new Server({
            hostKeys: [Buffer.from(options.privateKey, 'base64')],
        }, function (client) {
            client.on('authentication', function (ctx) {
                try {
                    let allowed = true;
                    if (!checkValue(Buffer.from(ctx.username), allowedUser))
                        allowed = false;

                    switch (ctx.method) {
                        case 'password':
                            if (!checkValue(Buffer.from(ctx.password), allowedPassword))
                                return ctx.reject();
                            break;
                        default:
                            return ctx.reject(['password']);
                    }

                    if (allowed)
                        ctx.accept();
                    else
                        ctx.reject();
                } catch (err) {
                    ctx.reject();
                }
            }).on('ready', () => {
                client.on('session', accept => {
                    const session = accept();
                    session.on('sftp', accept => {
                        const sftpStream = accept();
                        new SftpServer(sftpStream, {
                            sftp,
                            basePath,
                        });
                    });
                }).on('error', err => {
                    winston.log('error', err.message);
                });
            }).on('error', err => {
                winston.log('error', err.message);
            });
        }).listen(options.port || 0, '0.0.0.0', function () {
            winston.log('info', `${options.productCode}: SFTP server listening on port ${this.address().port}`);
        }).on('error', err => {
            winston.log('error', err.message);
        });
    } catch (err) {
        winston.log('error', err.message);
    }

    return server;
};

/**
 * Expose plugin methods.
 */
module.exports = {
    name: 'sftp-server',
    connect,
};
