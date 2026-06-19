// var appRoot = require('app-root-path');
const winston = require('winston');


// define the custom settings for each transport (file, console)
// OPTIMIZED: Reduced logging levels for production cost savings
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');
const enableConsole = process.env.ENABLE_CONSOLE_LOG === 'true' || process.env.NODE_ENV !== 'production';

const options = {
  file: {
    level: logLevel === 'debug' ? 'info' : logLevel, // File logs at info or higher
    filename: './logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 3, // Reduced from 5 to save storage
    colorize: false, // Disabled for production
    name: 'file.info',
  },
  filewarn: {
    level: 'warn',
    filename: './logs/warn.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
    colorize: false,
    name: 'file.warn',
  },
  fileerror: {
    level: 'error',
    filename: './logs/error.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    name: 'file.error',
  },
  console: {
    level: logLevel,
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// Build transports array based on environment
const transports = [
  new winston.transports.File(options.file),
  new winston.transports.File(options.filewarn),
  new winston.transports.File(options.fileerror),
];

// Only add console in development or if explicitly enabled
if (enableConsole) {
  transports.push(new winston.transports.Console(options.console));
}

// instantiate a new Winston Logger with the settings defined above
// eslint-disable-next-line new-cap
const logger = new winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: transports,
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write(message) {
    // use the 'info' log level so the output will
    // be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
