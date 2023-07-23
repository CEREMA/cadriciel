/** process environment variables */
require('dotenv').config({ path: __dirname + '/../.env' });

/** import required libraries */
const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const command = 'up' || process.argv[2];
const sql = {};
const directoryPath = __dirname + '/sql';
const files = fs.readdirSync(directoryPath);
const sqlFiles = files.filter((file) => path.extname(file) === '.sql');
const deleteItemsUntilUID = (array, uid) => {
  const index = array.findIndex((item) => item.includes(uid));
  if (index !== -1) {
    array.splice(0, index + 1);
  }
  return array;
};
const createSQLFunction = (filePath) => {
  function extractVariables(fileContent) {
    const pattern = /\${(\w+)}/g;
    const variables = {};
    let match;

    while ((match = pattern.exec(fileContent)) !== null) {
      const variableName = match[1];
      variables[variableName] = null;
    }

    return variables;
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  let variables = [];
  // Extract variables from the file content
  try {
    variables = extractVariables(fileContent);
  } catch (e) {
    variables = [];
  }

  // Create method dynamically
  const methodName = filePath.substring(
    filePath.lastIndexOf('/') + 1,
    filePath.lastIndexOf('.')
  );
  const methodBody = '`' + fileContent + '`';
  //methodBody = methodBody.replace(/\${/g, '${variables.');
  let methodParams = Object.keys(variables).join(', ');
  let methodDefinition = '';
  if (methodParams != '') {
    methodDefinition = `function ${methodName}({${methodParams}}) { return ${methodBody}; }`;
  } else {
    methodDefinition = `function ${methodName}() { return ${methodBody}; }`;
  }
  // Evaluate the method definition
  eval(methodDefinition);

  return eval(methodName);
};
sqlFiles.forEach((file) => {
  const functionName = path.machinasapiensname(file, '.sql');
  const filePath = path.join(directoryPath, file);
  const sqlFunction = createSQLFunction(filePath);
  sql[functionName] = sqlFunction;
});

/** If no DB_URI exit with a warning */
if (!process.env.DB_URI) {
  console.log('DB_URI not set');
  return unlockMigration();
}

/** Create a new Sequelize instance */
const db = new Sequelize(`${process.env.DB_URI}`, {
  logging: false,
  dialectOptions: {},
});

/** make a query with a callback */
const query = (sql, cb) => {
  db.query(sql, { raw: true })
    .then(function (r) {
      r = r[0];
      cb(null, r);
    })
    .catch(function (e) {
      if (cb) return cb({ error: e.message });
    });
};

/** INSERT helper */
function copyToInsert(copyCommand) {
  const [tableLine, ...dataLines] = copyCommand.split('\n');
  const tableName = tableLine.match(/COPY (.*?) \(/)[1];
  const columnNames = tableLine.match(/\((.*?)\)/)[1];

  const insertStatements = dataLines
    .map((dataLine) => {
      if (dataLine.trim() !== '\\.') {
        const values = dataLine
          .split('\t')
          .map((v) => {
            if (v.trim() === '\\N') {
              return 'NULL';
            } else {
              return `'${v.replace(/[\n\r]/g, '').replace(/'/g, "''")}'`;
            }
          })
          .join(', ');
        return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`;
      }
    })
    .filter(Boolean);

  return insertStatements;
}

/** flatten array */
function flattenArray(array) {
  let result = [];

  array.forEach((item) => {
    if (Array.isArray(item)) {
      result = result.concat(flattenArray(item)); // recursive call
    } else {
      result.push(item);
    }
  });

  return result;
}

/** execute bash queries */
const executeQueries = (group, ndx, cb, errors) => {
  if (!errors) errors = [];
  if (!group[ndx]) return cb(errors);
  const sql = group[ndx];
  let firstWord = sql.split(' ')[0];

  query(sql, (err, result) => {
    console.log(
      `${ndx + 1} / ${group.length} ${firstWord} ${
        err ? `error:${err.error}` : 'ok'
      }`
    );
    if (err) {
      errors.push([err, sql]);
    }
    executeQueries(group, ndx + 1, cb, errors);
  });
};

/** update last migration */
const update_last_migration_lock = (o, callback) => {
  query(
    `select * from history.last_migration order by createdat desc limit 1`,
    (err, result) => {
      if (err) return false;
      if (result.length == 0) {
        query(
          `insert into history.last_migration (lock) values ('${o}')`,
          (err) => {
            callback();
          }
        );
      } else {
        query(`update history.last_migration set lock='${o}'`, (err) => {
          callback();
        });
      }
    }
  );
};
const update_last_migration = (migration_id, callback) => {
  query(
    `select * from history.last_migration order by createdat desc limit 1`,
    (err, result) => {
      if (err) return false;
      if (result.length == 0) {
        query(
          `insert into history.last_migration (migrations_id) values ('${migration_id}')`,
          (err) => {
            callback();
          }
        );
      } else {
        query(
          `update history.last_migration set migrations_id='${migration_id}'`,
          (err) => {
            callback();
          }
        );
      }
    }
  );
};

/** run migrate */
const run_migrate = (migrate, ndx, cb) => {
  if (!migrate[ndx]) return cb();
  const result = require(`${__dirname}/../db/migrate/${migrate[ndx]}`);
  const migrate_id = migrate[ndx].split('_')[1].split('.')[0];
  console.log('processing ' + migrate_id);

  if (result.init === true) {
    initFirstMigration(migrate_id, () => {
      run_migrate(migrate, ndx + 1, cb);
    });
  } else
    executeQueries(result[command], 0, (errors) => {
      update_last_migration(migrate_id, () => {
        console.log('done.');
        run_migrate(migrate, ndx + 1, cb);
      });
    });
};

const run_schema = (cb) => {
  query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'history'`,
    (err, result) => {
      if (err) return console.log('** error connecting to database');
      if (result.length === 0) {
        query(sql.createSchema(), (err, result) => {
          if (err) return console.log('** error creating schema');
          return cb();
        });
      } else cb();
    }
  );
};

const lockMigration = (callback) => {
  query(`select * from history.last_migration`, (err, result) => {
    if (result.length == 0) return update_last_migration_lock(true, callback);
    if (result[0].lock == true) {
      console.log('migration is locked');
      return unlockMigration();
    } else {
      update_last_migration_lock(true, callback);
    }
  });
};

const unlockMigration = () => {
  return update_last_migration_lock(false, () => {
    db.close();
    process.exit(0);
  });
};

const initFirstMigration = (uuid, callback) => {
  const done = () => {
    update_last_migration(uuid, callback);
  };
  // first time migration
  console.log('init database snapshot...');
  return fs.readFile(
    __dirname + '/../db/dump/init.sql',
    'utf8',
    function (err, data) {
      if (err) data = '-- init database';

      let group = [];
      const sections = data
        .split('--\r\n')
        .map((s) => s.trim())
        .filter(Boolean);

      for (let i = 0; i < sections.length; i++) {
        if (sections[i].substring(0, 2) != '--') {
          if (sections[i].substring(0, 4) == 'COPY')
            group.push(copyToInsert(sections[i]));
          else group.push(sections[i]);
        }
      }

      group = flattenArray(group);
      group = group.map((element) => element.replace(/\r\n/g, '\n'));

      executeQueries(group, 0, () => {
        // looking for data in dump
        fs.readFile(
          __dirname + '/../db/dump/data.sql',
          'utf8',
          function (err, data) {
            if (err) return done();
            const commands = data.split('\n').reduce(
              (acc, line) => {
                // Concatenate line to last command in the accumulator
                acc[acc.length - 1] += line;

                // If the command ends with a semicolon, it's complete
                if (line.trim().endsWith(';')) {
                  acc.push(''); // Start a new command
                }
                return acc;
              },
              ['']
            );

            // Remove the last, possibly empty, command
            if (commands[commands.length - 1] === '') {
              commands.pop();
            }

            executeQueries(commands, 0, done);
          }
        );
      });
    }
  );
};

/** read migrate directory */
run_schema(() => {
  lockMigration(() => {
    fs.readdir(__dirname + '/../db/migrate', (err, files) => {
      if (err) return console.log("Can't find migrate folder");

      files = files.filter((file) => path.extname(file) === '.json');
      files.sort();

      /** read the last_migration */
      query('select * from history.last_migration', (err, result) => {
        if (result.length == 0) {
          if (files[0])
            initFirstMigration(files[0].split('_')[1].split('.json')[0]);

          // on exécute tous les snapshots
          run_migrate(files, 0, () => {
            console.log("Done! You're up to date.");
            return unlockMigration();
          });
        } else {
          if (result[0].state_id) {
            console.log("Don't use migrate on your master database.");
            console.log('last migration id: ' + result[0].migrations_id);
            return unlockMigration();
          }
          // on récupère l'ID de la dernière migration
          const lastMigration = result[0].migrations_id;
          const Migrations = deleteItemsUntilUID(files, lastMigration);
          run_migrate(Migrations, 0, () => {
            console.log("Done! You're up to date.");
            return unlockMigration();
          });
        }
      });
    });
  });
});
