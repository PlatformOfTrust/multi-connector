"use strict";
/**
 * Module dependencies.
 */
const fs = require('fs').promises;
const connector = require('./app/lib/connector');

/**
 * Environment variable generator.
 *
 * Converts templates, configs and resources to base64 format to be utilized from environment.
 * Set variables by copying the contents of each file to a variable named by the filename.
 */

// Set directory.
const tempDir = './temp';

// Make sure directory exists.
if (!fs.access(tempDir)) fs.mkdirSync(tempDir);

// Set listener for completion of loading.
connector.emitter.on('collections',
    // Write collections to file system in base64 format.
    async (collections) => {
    for (let i = 0; i < Object.keys(collections).length; i++) {
        try {
            await fs.writeFile(tempDir + '/' + Object.keys(collections)[i].toUpperCase(),
                Buffer.from(JSON.stringify(collections[Object.keys(collections)[i]])).toString('base64'),
                'utf8');
            console.log('Generated environment variable ' + Object.keys(collections)[i].toUpperCase() + '.');
        } catch (err) {
            console.log(err.message)
        }
    }
    // Exit.
    process.exit();
});
