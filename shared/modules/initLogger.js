const responseTime = require('response-time');
const winston = require('winston');
const chalk = require('chalk-v2');
const util = require('util');
const DailyRotateFile = require('winston-daily-rotate-file');
const { format, combine, timestamp, printf, colorize, json } = winston.format;

// Configure log rotation
const customJsonFormat = json({
  space: 0,
});
const { parse, stringify, toJSON, fromJSON } = require('flatted');

const logFile = {
  dirname: __dirname + '/../../logs',
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    printf((info) => {
      const { timestamp, level, message, ...args } = info;
      let lvl = '';
      let msg = '';
      if (!message) return;
      if (message.indexOf) {
        if (
          message.indexOf('GET') > -1 ||
          message.indexOf('PUT') > -1 ||
          message.indexOf('PATCH') > -1 ||
          message.indexOf('DELETE') > -1 ||
          message.indexOf('POST') > -1 ||
          message.indexOf('OPTION') > -1
        ) {
          if (message.indexOf('GET') > -1) {
            lvl = 'get';
            msg = message.replace('GET', '');
          }
          if (message.indexOf('OPTION') > -1) {
            lvl = 'option';
            msg = message.replace('GET', '');
          }
          if (message.indexOf('POST') > -1) {
            lvl = 'post';
            msg = message.replace('POST', '');
          }
          if (message.indexOf('DELETE') > -1) {
            lvl = 'delete';
            msg = message.replace('DELETE', '');
          }
          if (message.indexOf('PUT') > -1) {
            lvl = 'put';
            msg = message.replace('PUT', '');
          }
          if (message.indexOf('PATCH') > -1) {
            lvl = 'patch';
            msg = message.replace('PATCH', '');
          }
          if (message.replace)
            msg = message.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            );
        } else {
          if (level == 'fatal') lvl = 'fatal';
          if (level == 'info') lvl = 'info';
          if (level == 'error') lvl = 'error';
          if (level == 'warning') lvl = 'warn';
          if (level == 'debug') lvl = 'debug';
          if (level == 'trace') lvl = 'trace';
          if (message.replace)
            msg = message.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            );
        }
        return stringify({
          timestamp: info.timestamp,
          level: lvl,
          message: msg,
        });
      } else {
        if (level == 'fatal') lvl = 'fatal';
        if (level == 'info') lvl = 'info';
        if (level == 'error') lvl = 'error';
        if (level == 'warning') lvl = 'warn';
        if (level == 'debug') lvl = 'debug';
        if (level == 'trace') lvl = 'trace';
        if (message.replace)
          msg = message.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ''
          );
        return stringify({
          timestamp: info.timestamp,
          level: lvl,
          message: msg,
        });
      }
    })
  ),
};
const logConsole = {
  format: winston.format.combine(
    winston.format.timestamp(),
    printf((info) => {
      const { timestamp, level, message, ...args } = info;
      const ts = chalk.white(timestamp.slice(0, 19).replace('T', ' '));
      let lvl = '';
      let msg = '';
      if (!message) return;
      if (message.indexOf) {
        if (
          message.indexOf('GET') > -1 ||
          message.indexOf('PUT') > -1 ||
          message.indexOf('PATCH') > -1 ||
          message.indexOf('DELETE') > -1 ||
          message.indexOf('POST') > -1
        ) {
          if (message.indexOf('GET') > -1) {
            lvl = chalk.blue('[GET]');
            msg = message.replace('GET', '');
          }
          if (message.indexOf('POST') > -1) {
            lvl = chalk.blue('[POST]');
            msg = message.replace('POST', '');
          }
          if (message.indexOf('DELETE') > -1) {
            lvl = chalk.blue('[DELETE]');
            msg = message.replace('DELETE', '');
          }
          if (message.indexOf('PUT') > -1) {
            lvl = chalk.blue('[PUT]');
            msg = message.replace('PUT', '');
          }
          if (message.indexOf('PATCH') > -1) {
            lvl = chalk.blue('[PATCH]');
            msg = message.replace('PATCH', '');
          }
        } else {
          if (level == 'fatal') lvl = chalk.red('[FATAL]');
          if (level == 'info') lvl = chalk.green('[INFO]');
          if (level == 'error') lvl = chalk.redBright('[ERROR]');
          if (level == 'warning') lvl = chalk.yellow('[WARN]');
          if (level == 'debug') lvl = chalk.magenta('[DEBUG]');
          if (level == 'trace') lvl = chalk.cyan('[TRACE]');
          msg = message;
        }
      } else {
        if (level == 'fatal') lvl = chalk.red('[FATAL]');
        if (level == 'info') lvl = chalk.green('[INFO]');
        if (level == 'error') lvl = chalk.redBright('[ERROR]');
        if (level == 'warning') lvl = chalk.yellow('[WARN]');
        if (level == 'debug') lvl = chalk.magenta('[DEBUG]');
        if (level == 'trace') lvl = chalk.cyan('[TRACE]');
        msg = message;
      }
      return ts + ' ' + lvl + ' ' + chalk.bold(msg);
    })
  ),
};
const logLOKI = {
  host: process.env.LOKI_URI,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    printf((info) => {
      const { timestamp, level, message, ...args } = info;
      let lvl = '';
      let msg = '';
      if (!message) return;
      if (message.indexOf) {
        if (
          message.indexOf('GET') > -1 ||
          message.indexOf('PUT') > -1 ||
          message.indexOf('PATCH') > -1 ||
          message.indexOf('DELETE') > -1 ||
          message.indexOf('POST') > -1 ||
          message.indexOf('OPTION') > -1
        ) {
          if (message.indexOf('GET') > -1) {
            lvl = 'get';
            msg = message.replace('GET', '');
          }
          if (message.indexOf('OPTION') > -1) {
            lvl = 'option';
            msg = message.replace('GET', '');
          }
          if (message.indexOf('POST') > -1) {
            lvl = 'post';
            msg = message.replace('POST', '');
          }
          if (message.indexOf('DELETE') > -1) {
            lvl = 'delete';
            msg = message.replace('DELETE', '');
          }
          if (message.indexOf('PUT') > -1) {
            lvl = 'put';
            msg = message.replace('PUT', '');
          }
          if (message.indexOf('PATCH') > -1) {
            lvl = 'patch';
            msg = message.replace('PATCH', '');
          }
          if (message.replace)
            msg = message.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            );
        } else {
          if (level == 'fatal') lvl = 'fatal';
          if (level == 'info') lvl = 'info';
          if (level == 'error') lvl = 'error';
          if (level == 'warning') lvl = 'warn';
          if (level == 'debug') lvl = 'debug';
          if (level == 'trace') lvl = 'trace';
          if (message.replace)
            msg = message.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              ''
            );
        }
        return stringify({
          timestamp: info.timestamp,
          level: lvl,
          message: msg,
        });
      } else {
        if (level == 'fatal') lvl = 'fatal';
        if (level == 'info') lvl = 'info';
        if (level == 'error') lvl = 'error';
        if (level == 'warning') lvl = 'warn';
        if (level == 'debug') lvl = 'debug';
        if (level == 'trace') lvl = 'trace';
        if (message.replace)
          msg = message.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            ''
          );
        return stringify({
          timestamp: info.timestamp,
          level: lvl,
          message: msg,
        });
      }
    })
  ),
};

const logger = winston.createLogger({
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  transports: [
    new winston.transports.Console(logConsole),
    new DailyRotateFile(logFile),
    //new LokiTransport(logLOKI),
  ],
});

const Logger = {
  info: (...message) => {
    if (!message) return;
    if (message.length == 1) message = message[0];
    if (typeof message === 'object' && message !== null) {
      message = stringify(message, null, 4);
    }
    //if (Array.isArray(message)) message = stringify(message, null, 4);
    logger.info(message);
  },
  fatal: (...message) => {
    if (!message) return;
    if (message.length == 1) message = message[0];
    if (typeof message === 'object' && message !== null) {
      message = stringify(message, null, 4);
    }
    //if (Array.isArray(message)) message = stringify(message, null, 4);
    logger.fatal(message);
  },
  debug: (...message) => {
    if (!message) return;
    if (message.length == 1) message = message[0];
    if (typeof message === 'object' && message !== null) {
      message = stringify(message, null, 4);
    }
    //if (Array.isArray(message)) message = stringify(message, null, 4);
    logger.debug(message);
  },
  error: (message) => {
    if (!message) return;
    if (message.length == 1) message = message[0];
    if (typeof message === 'object' && message !== null) {
      message = stringify(message, null, 4);
    }
    //if (Array.isArray(message)) message = stringify(message, null, 4);
    logger.error(message);
  },
  warn: (message) => {
    if (!message) return;
    if (message.length == 1) message = message[0];
    if (typeof message === 'object' && message !== null) {
      message = stringify(message, null, 4);
    }
    //if (Array.isArray(message)) message = stringify(message, null, 4);
    logger.warn(message);
  },
};
// Définir une nouvelle fonction console.log
console.log = (...args) => {
  //var args = Array.prototype.slice.call(arguments);

  // Format each argument that is an object
  args = args.map((arg) =>
    typeof arg === 'object'
      ? util.inspect(arg, { depth: 2, colors: true })
      : arg
  );
  logger.info(args.join(' '));
};
if (global.app)
  app.use(
    responseTime(function (req, res, time) {
      let status = '';
      if (res.statusCode * 1 < 200) status = chalk.white(res.statusCode);
      if (res.statusCode * 1 >= 500) status = chalk.red(res.statusCode);
      if (res.statusCode * 1 >= 200 && res.statusCode * 1 < 300)
        status = chalk.green(res.statusCode);
      if (res.statusCode * 1 >= 300 && res.statusCode * 1 < 400)
        status = chalk.cyan(res.statusCode);
      if (res.statusCode * 1 >= 400 && res.statusCode * 1 < 500)
        status = chalk.yellow(res.statusCode);
      logger.info(
        `${req.method} ${chalk.bold(req.url)} (${Math.round(
          time
        )} ms) ${status}`
      );
    })
  );

module.exports = {
  global: {
    originalConsoleLog: originalConsoleLog,
    logger: Logger,
  },
};
