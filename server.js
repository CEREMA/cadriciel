const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envSamplePath = path.join(__dirname, '.env.sample');

try {
  // Check if .env file exists
  fs.accessSync(envPath, fs.constants.F_OK);
} catch (err) {
  try {
    fs.copyFileSync(envSamplePath, envPath);
  } catch (err) {
    console.error('Error copying .env.sample to .env:', err);
    process.exit(1);
  }
}
require('dotenv').config();

global.sys = {
  package: require('./package.json'),
};

console.log('\n  📦 starting ' + sys.package.name + ' v' + sys.package.version);

/** loading libraries */

const express = require('express');
const Redis = require('ioredis');
const http = require('http');
const chalk = require('chalk');
const { Queue, QueueEvents } = require('bullmq');

let connection;

if (process.env.SESSION)
  connection = new Redis(process.env.SESSION, {
    maxRetriesPerRequest: null,
  });

console.log(' ');

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
const generateAngularEnvironment = () => {
  let result = 'export const environment = {\n';

  for (const key in process.env) {
    if (key.startsWith('CLIENT_')) {
      let value = process.env[key];

      // Remove CLIENT_ prefix and make camelCase
      const newKey = key.slice(7).replace(/_(\w)/g, (_, l) => l.toUpperCase());

      // Check if value is an array
      if (value.startsWith('[') && value.endsWith(']')) {
        // Parse the array, remove quotes from elements and split by comma
        value = value.slice(1, -1).replace(/"/g, '').split(',');
        value = JSON.stringify(value);
      } else if (value === 'true' || value === 'false') {
        // boolean, no changes required
      } else {
        value = `'${value}'`; // string, wrap with quotes
      }

      result += `  ${newKey}: ${value},\n`;
    }
  }

  result += '};\n';

  // Write result to environment.js file
  fs.writeFileSync(
    `${__dirname}/client/src/environments/environment.ts`,
    result
  );
};
const runMigrate = async (cb) => {
  if (!process.env.DB_URI) return cb();
  const { Sequelize, QueryTypes } = require('sequelize');
  const db = new Sequelize(`${process.env.DB_URI}`, {
    logging: false,
    dialectOptions: {},
  });
  const { spawn } = require('child_process');
  const chalk = require('chalk');

  try {
    const result = await db.query(
      `select * from history.last_migration where state_id is not null`,
      { type: QueryTypes.SELECT }
    );
    if (result.length > 0) return cb();
  } catch (e) {}

  db.close();
  console.log('\n' + chalk.bgWhite('  Starting migration'.padEnd(80, ' ')));

  const migrate = spawn('npm', ['run', 'db:migrate']);
  console.log(' ');
  migrate.stdout.on('data', (data) => {
    if (data.indexOf('>') == -1) console.log(data.toString().trim());
  });

  migrate.stderr.on('data', (data) => {
    //console.error(`${data}`);
  });

  migrate.on('close', () => {
    console.log(' ');
    cb();
  });
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

/** init web server */
global.app = express();
global.server = http.createServer(app);

global.originalConsoleLog = console.log;
global.originalConsoleError = console.error;
global.originalConsoleWarn = console.warn;
global.originalConsoleInfo = console.info;
global.originalConsoleDebug = console.debug;
global.originalConsoleTrace = console.trace;

const startServer = () => {
  /** PORTS */
  var port = 3000;
  if (process.env.URI) {
    var url = process.env.URI.split('://')[1];
    if (url.indexOf(':') > -1) port = url.split(':')[1] * 1;
  }
  /** Start server */
  server.listen(port, function () {
    originalConsoleLog(
      '\n  🚀 ' + sys.package.name + ' started on port ' + port + '\n'
    );
    /** Init script */
    if (fs.existsSync(__dirname + '/start/init-server.js')) {
      require(__dirname + '/start/init-server.js')();
    }
  });
};

const LoadServerModules = () => {
  /** Middlewares */
  var dir = __dirname + '/middlewares';
  var ddir = getAllFiles('middlewares/');
  if (ddir.length > 0) {
    originalConsoleLog(chalk.bgWhite('  Loading middlewares'.padEnd(80, ' ')));
    originalConsoleLog(' ');
  }
  for (var i = 0; i < ddir.length; i++) {
    var unit = ddir[i].substr(ddir[i].lastIndexOf('/') + 1, ddir[i].length);
    unit = unit.substr(0, unit.lastIndexOf('.'));
    var uri =
      '/middlewares' +
      ddir[i].substr(dir.length, ddir[i].length - dir.length - 3);
    global[unit] = require(ddir[i]);
    originalConsoleLog(chalk.yellow('  o register Middleware ' + unit));
  }
  if (ddir.length > 0) originalConsoleLog(' ');

  /** load shared modules */
  var ddir = getAllFiles('shared/modules');
  if (ddir.length > 0) {
    originalConsoleLog(chalk.bgWhite('  Loading modules'.padEnd(80, ' ')));
    originalConsoleLog(' ');
  }

  for (var i = 0; i < ddir.length; i++) {
    var unit = ddir[i].substr(ddir[i].lastIndexOf('/') + 1, ddir[i].length);
    unit = unit.substr(0, unit.lastIndexOf('.'));
    originalConsoleLog(chalk.yellow('  -> loading module ' + unit));
    const shared_module = require(ddir[i]);
    for (let el in shared_module) {
      if (shared_module.global) {
        for (let item in shared_module.global) {
          global.sys = Object.assign(global.sys, shared_module.global[item]);
          global[item] = shared_module.global[item];
          originalConsoleLog(chalk.cyan('     o register ' + item));
        }
      } else {
        global.sys = Object.assign(global.sys, shared_module);
        originalConsoleLog(chalk.cyan('     o register sys.' + el));
      }
    }
  }
  if (ddir.length > 0) originalConsoleLog(' ');

  /** Loading jobs */
  if (process.env.SESSION) {
    var dir = fs.readdirSync(__dirname + '/jobs');
    const includeExtension = '.js';
    dir = dir.filter((file) => path.extname(file) === includeExtension);

    if (dir.length > 0) {
      originalConsoleLog(chalk.bgWhite('  Loading jobs'.padEnd(80, ' ')));
      originalConsoleLog(' ');
    }
    global.sys.jobs = {};
    for (let i = 0; i < dir.length; i++) {
      if (dir[i] != 'config')
        sys.jobs[dir[i].split('.js')[0]] = new Queue(dir[i].split('.js')[0], {
          connection,
        });
      originalConsoleLog(
        chalk.cyan('  o register job ' + dir[i].split('.js')[0])
      );
    }
    if (dir.length > 0) originalConsoleLog(' ');
  }

  /** loading API */

  originalConsoleLog(chalk.bgWhite('  Loading API'.padEnd(80, ' ')));
  originalConsoleLog(' ');

  /** API */
  var dir = __dirname + '/api';
  var sysdir = __dirname + '/.cadriciel/api';
  var ddir = getAllFiles('api/');
  var ddirsys = getAllFiles('.cadriciel/api/');

  sys.api = {};
  for (var i = 0; i < ddir.length; i++) {
    if (ddir[i].indexOf('@') > -1) {
      var uri =
        '/' + ddir[i].substr(dir.length + 2, ddir[i].length - dir.length - 5);
    } else
      var uri =
        '/api' + ddir[i].substr(dir.length, ddir[i].length - dir.length - 3);
    if (ddir[i].indexOf('.json') == -1) {
      var unit = require(ddir[i]);
      var z = unit(app, express);
      var methods = z.methods;
      var middlewares = z.middlewares;
      if (!middlewares) middlewares = [];
      var info = z.info;
      if (!info) info = {};
      for (var el in methods) {
        if (typeof methods[el] === 'function') {
          app[el](uri, middlewares, methods[el]);
          if (!info[el])
            info[el] = {
              security: [
                {
                  OAuth2: [],
                },
              ],
              summary: 'no summary - please provide one',
              description: 'no description',
            };
          if (!info[el].responses) info[el].responses = {};
          info[el].tags = ['API'];
          info[el].responses = Object.assign(info[el].responses, {
            200: {
              description: 'OK',
            },
          });
        } else {
          if (!info[el]) info[el] = {};
          if (methods[el].secure === true) {
            middlewares.push(auth);
            info[el].tags = ['API'];
            info[el].security = [
              {
                OAuth2: [],
              },
            ];
          }
          if (methods[el].summary) info[el].summary = methods[el].summary;
          if (!info[el].summary) info[el].summary = methods[el].description;
          if (methods[el].description)
            info[el].description = methods[el].description;
          if (methods[el].parameters)
            info[el].parameters = methods[el].parameters;
          info[el].responses = {};
          if (methods[el].responses) info[el].responses = methods[el].responses;
          info[el].responses = Object.assign(info[el].responses, {
            200: {
              description: 'OK',
            },
          });
          app[el](uri, middlewares, methods[el].fn);
        }
      }
      sys.api[uri] = info;
      originalConsoleLog(chalk.cyan('  o register API ' + uri));
    } else global.sys.shield = require(ddir[i]);
  }
  for (var i = 0; i < ddirsys.length; i++) {
    if (ddirsys[i].indexOf('@') > -1) {
      var uri =
        '/' +
        ddirsys[i].substr(
          sysdir.length + 2,
          ddirsys[i].length - sysdir.length - 5
        );
    } else
      var uri =
        '/api' +
        ddirsys[i].substr(sysdir.length, ddirsys[i].length - sysdir.length - 3);
    if (ddirsys[i].indexOf('.json') == -1) {
      var unit = require(ddirsys[i]);
      var z = unit(app, express);
      var methods = z.methods;
      var middlewares = z.middlewares;
      if (!middlewares) middlewares = [];
      var info = z.info;
      if (!info) info = {};
      for (var el in methods) {
        if (typeof methods[el] === 'function') {
          app[el](uri, middlewares, methods[el]);
          if (!info[el])
            info[el] = {
              security: [
                {
                  OAuth2: [],
                },
              ],
              summary: 'no summary - please provide one',
              description: 'no description',
            };
          if (!info[el].responses) info[el].responses = {};
          info[el].tags = ['API'];
          info[el].responses = Object.assign(info[el].responses, {
            200: {
              description: 'OK',
            },
          });
        } else {
          if (!info[el]) info[el] = {};
          if (methods[el].secure === true) {
            middlewares.push(auth);
            info[el].tags = ['API'];
            info[el].security = [
              {
                OAuth2: [],
              },
            ];
          }
          if (methods[el].summary) info[el].summary = methods[el].summary;
          if (!info[el].summary) info[el].summary = methods[el].description;
          if (methods[el].description)
            info[el].description = methods[el].description;
          if (methods[el].parameters)
            info[el].parameters = methods[el].parameters;
          info[el].responses = {};
          if (methods[el].responses) info[el].responses = methods[el].responses;
          info[el].responses = Object.assign(info[el].responses, {
            200: {
              description: 'OK',
            },
          });
          app[el](uri, middlewares, methods[el].fn);
        }
      }
      sys.api[uri] = info;
      //originalConsoleLog(chalk.cyan('  o register API ' + uri));
    } else global.sys.shield = require(ddirsys[i]);
  }
  /** serve static files */
  app.use(express.static(__dirname + '/public'));

  app.get('/', function (req, res) {
    res.json({ status: 'ok' });
  });

  app.get('/status', function (req, res) {
    res.json({ status: 'ok' });
  });

  /** handle static page */
  app.get('*', function (req, res) {
    if (
      req.url.indexOf('/api/') > -1 ||
      req.url.indexOf('/api-docs/') > -1 ||
      req.url.indexOf('/db/') > -1
    ) {
      console.log(req.url);
      return res.status(404).json({ err: 'Not found' });
    }
    res.sendFile(path.resolve(__dirname + '/public', 'index.html'));
  });
  generateAngularEnvironment();
  startServer();
  originalConsoleDebug(' ');
};

if (process.argv[2] === '--update') return runMigrate(LoadServerModules);
else LoadServerModules();
