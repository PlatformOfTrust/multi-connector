'use strict';
/**
 * Module dependencies.
 */
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const {createLogger, format, transports} = require('winston');
const {timestamp, printf} = format;
require('winston-daily-rotate-file');

/**
 * Create logger.
 */

// Set directory for log files.
const logDir = 'log';

// Create log directory, if it does not exist.
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Define logging format.
const myFormat = printf(({level, message, timestamp}) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    /**
     * Define logging transports.
     */
    transports: [
        new (transports.Console)({
            level: 'silly',
            format: format.combine(
                timestamp(),
                format.colorize(),
                myFormat,
            ),
            handleExceptions: true,
            exitOnError: false,
        }),
        new (transports.DailyRotateFile)({
            level: env === 'development' ? 'verbose' : 'info',
            filename: `${logDir}/%DATE%-results.log`,
            format: format.combine(
                timestamp(),
                format.json(),
            ),
            datePattern: 'YYYY-MM-DD',
            handleExceptions: true,
            exitOnError: false,
        }),
    ],
});

/**
 * Expose logger.
 */

module.exports = logger;
