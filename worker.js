const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envSamplePath = path.join(__dirname, '.env.sample');

try {
  // Check if .env file exists
  fs.accessSync(envPath, fs.constants.F_OK);
} catch (err) {
  // If .env file doesn't exist, copy .env.sample to .env
  console.log('.env file not found. Copying from .env.sample...');
  try {
    fs.copyFileSync(envSamplePath, envPath);
    console.log('Successfully copied .env.sample to .env');
  } catch (err) {
    console.error('Error copying .env.sample to .env:', err);
    process.exit(1);
  }
}
require('dotenv').config();

console.log(
  '\n  📦 starting omneedia worker v' + require('./package.json').version
);

/** loading libraries */

const { Worker, Job } = require('bullmq');
const Redis = require('ioredis');
const chalk = require('chalk');

let redisClient;
let connection;

/** misc utils */
const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      if (path.extname(file) === '.js') {
        arrayOfFiles.push(path.join(__dirname, dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
};
if (!('toJSON' in Error.prototype))
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      var alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true,
  });

/** load shared modules */
global.sys = {};
global.app = false;
console.log(' ');
console.log(chalk.bgWhite('  Loading modules'.padEnd(80, ' ')));
console.log(' ');
var ddir = getAllFiles('shared/modules');
for (var i = 0; i < ddir.length; i++) {
  var unit = ddir[i].substr(ddir[i].lastIndexOf('/') + 1, ddir[i].length);
  unit = unit.substr(0, unit.lastIndexOf('.'));
  const shared_module = require(ddir[i]);
  for (let el in shared_module) {
    if (shared_module.global) {
      global.sys = Object.assign(global.sys, shared_module.global);
      global[path.machinasapiensname(ddir[i]).split('.js')[0]] =
        shared_module.global;
    } else global.sys = Object.assign(global.sys, shared_module);
    let cpx = '';
    if (el != 'global') cpx = 'sys.' + el;
    else cpx = path.machinasapiensname(ddir[i]).split('.js')[0];
    console.log(chalk.cyan('  o register ' + cpx));
  }
}
console.log(' ');

/** store */
const { createClient } = require('redis');

if (process.env.SESSION) {
  redisClient = createClient({
    url: process.env.SESSION,
    legacyMode: true,
  });
  redisClient.on('error', function (err) {
    logger.error('Could not establish a connection with redis. ' + err);
  });
  redisClient.on('connect', function (err) {
    logger.info('Connected to session successfully');
  });
  redisClient.connect().catch(logger.error);
  connection = new Redis(process.env.SESSION, {
    maxRetriesPerRequest: null,
  });
}

/** Loading jobs */
console.log(' ');
console.log(chalk.bgWhite('  Loading jobs'.padEnd(80, ' ')));
console.log(' ');
var dir = fs.readdirSync(__dirname + '/jobs');
const includeExtension = '.js';
dir = dir.filter((file) => path.extname(file) === includeExtension);

global.sys.jobs = {};
for (var i = 0; i < dir.length; i++) {
  if (dir[i] != 'config')
    sys.jobs[dir[i].split('.js')[0]] = new Worker(
      dir[i].split('.js')[0],
      require(__dirname + '/jobs/' + dir[i]),
      {
        connection,
      }
    );
  console.log(chalk.cyan('  o register job ' + dir[i].split('.js')[0]));
}

console.log('\n  🚀 omneedia worker started.\n');

/** Init script */
if (fs.existsSync(__dirname + '/start/init-worker.js')) {
  require(__dirname + '/start/init-worker.js')();
}
