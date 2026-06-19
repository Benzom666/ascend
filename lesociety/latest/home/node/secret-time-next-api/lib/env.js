/* eslint-disable prefer-destructuring */
const fs = require('fs');
const _ = require('lodash');
const winston = require('winston');
const dotenv = require('dotenv').config();

// Load all the values from the .env file to override the process.env
try {
  let env = fs.readFileSync(`${__dirname}/../.env`, 'utf8');
  env = env.split('\n');

  _.each(env, (key) => {
    const matches = key.match(/^([^=]+)=["']?(.*)["']?$/);
    if (matches) {
      process.env[matches[1]] = matches[2];
    }
  });
} catch (e) {
  winston.info('No .env file found, assuming keys are already present');
}

// Check if we have all the keys that we wanted
// MONGO_URI is optional if MONGO_USER, MONGO_PASS, MONGO_HOST are provided
const hasMongoComponents = process.env.MONGO_USER && process.env.MONGO_PASS && process.env.MONGO_HOST;
const requiredKeys = {
  MONGO_URI: { required: !hasMongoComponents },
  APP_URL: { required: true },
  // CLOUD_CONVERT_KEY: { required: true },
};
_.each(requiredKeys, (value, key) => {
  if (value.required && !process.env[key]) {
    winston.error(`Environment variable ${key} not found!`);
    process.exit(1);
  }
});
