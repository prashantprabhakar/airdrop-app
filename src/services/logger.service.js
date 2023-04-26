
//@ts-check
'use strict';
const config = require('../config/config');
const logDir = config.logging.logdir;
const loglevel = config.logging.level;
const winston = require('winston');
require('winston-daily-rotate-file');

var fs = require('fs');

const tsFormat = () => (new Date()).toLocaleTimeString();

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: loglevel
    }),
    new (winston.transports.DailyRotateFile)({
      filename: `${logDir}/results.log`,
      timestamp: tsFormat,
      datePattern: 'yyyy-MM-dd.',
      prepend: true,
      level: loglevel
    })
  ]
});

module.exports = logger;