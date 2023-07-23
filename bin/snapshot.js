require('dotenv').config({ path: __dirname + '/../.env' });

const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const generateTableSQL = require('./migrations/generateTableSQL');
const generateTypeSQL = require('./migrations/generateTypeSQL');
const generateColumnSQL = require('./migrations/generateColumnSQL');
const generateConstraintsSQL = require('./migrations/generateConstraintsSQL');
const generatePoliciesSQL = require('./migrations/generatePoliciesSQL');
const generateFunctionsSQL = require('./migrations/generateFunctionsSQL');
const generateTriggersSQL = require('./migrations/generateTriggersSQL');
const generateViewsSQL = require('./migrations/generateViewsSQL');

// Define the path of the lock file
const lockFilePath = path.join(os.tmpdir(), 'migration.lock');

const compareArrays = (oldArray, newArray) => {
  // Utility function to check if two objects are equal
  function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  // Utility function to get the differing properties between two objects
  function getDifferentProperties(obj1, obj2) {
    const diffProps = {};
    for (const key of Object.keys(obj2)) {
      if (!isEqual(obj1[key], obj2[key])) {
        diffProps[key] = {
          id: obj1.id,
          props: {
            from: obj1[key],
            to: obj2[key],
          },
        };
      }
    }
    return diffProps;
  }

  const created = [];
  const updated = [];
  const deleted = [];

  // Check for created and updated items
  for (const newItem of Object.values(newArray)) {
    const oldItem = oldArray[newItem.id];
    if (!oldItem) {
      created.push(newItem);
    } else {
      const diffProps = getDifferentProperties(oldItem, newItem);
      if (Object.keys(diffProps).length > 0) {
        updated.push(diffProps);
      }
    }
  }

  // Check for deleted items
  for (const oldItem of Object.values(oldArray)) {
    if (!newArray[oldItem.id]) {
      deleted.push(oldItem);
    }
  }

  return { created, updated, deleted };
};

const compareConstraintsArrays = (oldArray, newArray) => {
  function toMap(arr) {
    const map = {};
    for (const key in arr) {
      arr[key].forEach((item) => {
        map[item.constraint_name] = item;
      });
    }
    return map;
  }

  const oldMap = toMap(oldArray);
  const newMap = toMap(newArray);

  const created = [];
  const updated = [];
  const deleted = [];

  function diffFields(oldItem, newItem) {
    const diffs = {};
    for (const key in newItem) {
      if (key === 'table_name') continue; // Ignore table_name.
      if (JSON.stringify(newItem[key]) !== JSON.stringify(oldItem[key])) {
        diffs[key] = {
          old: oldItem[key],
          new: newItem[key],
        };
      }
    }
    return diffs;
  }

  // Check for created and updated items.
  for (const key in newMap) {
    if (!oldMap.hasOwnProperty(key)) {
      created.push(newMap[key]);
    } else {
      const diffs = diffFields(oldMap[key], newMap[key]);
      if (Object.keys(diffs).length > 0) {
        updated.push({
          constraint_name: key,
          differences: diffs,
        });
      }
    }
  }

  // Check for deleted items.
  for (const key in oldMap) {
    if (!newMap.hasOwnProperty(key)) {
      deleted.push(oldMap[key]);
    }
  }

  return { created, updated, deleted };
};

const jsonString = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string') {
      return value.replace(/'/g, "''");
    }
    return value;
  });
};

const directoryPath = __dirname + '/sql';
const files = fs.readdirSync(directoryPath);
const sqlFiles = files.filter((file) => path.extname(file) === '.sql');

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
const sql = {};
sqlFiles.forEach((file) => {
  const functionName = path.machinasapiensname(file, '.sql');
  const filePath = path.join(directoryPath, file);
  const sqlFunction = createSQLFunction(filePath);
  sql[functionName] = sqlFunction;
});

if (!process.env.DB_URI) return false;

const db = new Sequelize(`${process.env.DB_URI}`, {
  logging: false,
  dialectOptions: {},
});

const schema = process.argv[3] || 'public';
let name;
if (process.argv[2] == '--init') Init = true;
else {
  Init = false;
  if (process.argv[2]) {
    if (process.argv[2].split(':').length > 1) {
      name = process.argv[2].split(':')[0];
      UUID = process.argv[2].split(':')[1];
    } else name = process.argv[2];
  }
}
if (!name) name = require('shortid').generate();

var new_schema = process.argv[4] || schema;

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
const search = (obj, criteria, fields) => {
  let result = [];
  for (const key in obj) {
    const item = obj[key];
    let match = true;
    for (const prop in criteria) {
      if (item[prop] !== criteria[prop]) {
        match = false;
        break;
      }
    }
    if (match) {
      if (fields) {
        const filteredItem = {};
        fields.forEach((field) => {
          filteredItem[field] = item[field];
        });
        result.push(filteredItem);
      } else {
        result.push(item);
      }
    }
  }
  if (result.length === 1) {
    result = result[0];
    let counter = 0;
    for (let el in result) counter++;
    if (counter === 1) result = result[Object.keys(result)[0]];
  }
  return result;
};
const getSQL = (schema, cb) => {
  return {
    tables: sql.tables_by_schema({ schema: schema }),
    columns: sql.columns_by_schema({ schema: schema }),
    constraints: sql.constraints_by_schema({ schema: schema }),
    types: sql.types_by_schema({ schema: schema }),
    pg_types: sql.types(),
    policies: sql.policies_by_schema({ schema: schema }),
    functions: sql.functions_by_schema({ schema: schema }),
    triggers:
      "SELECT pg_t.oid AS id, pg_t.tgrelid AS table_id, CASE WHEN pg_t.tgenabled = 'D' THEN 'DISABLED' WHEN pg_t.tgenabled = 'O' THEN 'ORIGIN' WHEN pg_t.tgenabled = 'R' THEN 'REPLICA' WHEN pg_t.tgenabled = 'A' THEN 'ALWAYS' END AS enabled_mode, (SELECT array_agg(substring(e, 2)) FROM unnest(regexp_split_to_array(pg_t.tgargs::text, '\\x00')) AS e)[:pg_t.tgnargs] AS function_args, is_t.trigger_name AS name, is_t.event_object_table AS table, is_t.event_object_schema AS schema, is_t.action_condition AS condition, is_t.action_orientation AS orientation, is_t.action_timing AS activation, ARRAY_AGG(is_t.event_manipulation)::text[] AS events, pg_p.proname AS function_name, pg_n.nspname AS function_schema FROM pg_trigger AS pg_t JOIN pg_class AS pg_c ON pg_t.tgrelid = pg_c.oid JOIN information_schema.triggers AS is_t ON is_t.trigger_name = pg_t.tgname AND pg_c.relname = is_t.event_object_table JOIN pg_proc AS pg_p ON pg_t.tgfoid = pg_p.oid JOIN pg_namespace AS pg_n ON pg_p.pronamespace = pg_n.oid GROUP BY pg_t.oid, pg_t.tgrelid, pg_t.tgenabled, pg_t.tgargs, pg_t.tgnargs, is_t.trigger_name, is_t.event_object_table, is_t.event_object_schema, is_t.action_condition, is_t.action_orientation, is_t.action_timing, pg_p.proname, pg_n.nspname;",
    views: sql.views_by_schema({ schema: schema }),
  };
};
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

/** load SQLs */
const q = getSQL(schema);

/** execute bash queries */
const executeQueries = (group, ndx, cb, errors) => {
  if (!errors) errors = [];
  if (!group[ndx]) return cb(errors);
  const sql = group[ndx];
  let firstWord = sql.split(' ')[0];

  query(sql, (err, result) => {
    if (err) {
      if (err.error.indexOf('already exists') > -1) err = null;
    }
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

const update_last_migration = (migration_id, callback) => {
  query(
    `select * from history.last_migration order by createdat limit 1`,
    (err, result) => {
      if (err) {
        fs.unlink(lockFilePath, () => {
          console.log('done.');
          process.exit(0);
        });
        return;
      }
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

const generateMigrateScript = (migration_id, migration_date, callback) => {
  const sql_migrate = sql.migrations_selected({ migration_id: migration_id });
  query(sql_migrate, (err, result) => {
    if (err) {
      return fs.unlink(lockFilePath, () => {
        console.log(err.message);
      });
    }
    if (result.length == 1) {
      result.unshift({
        tables: {},
        columns: {},
        constraints: {},
        types: {},
        policies: {},
        pg_types: {},
        functions: {},
        triggers: {},
        views: {},
      });
    }
    const ID = result.length - 1;

    let tbl1 = result[ID - 1].tables;
    let tbl2 = result[ID].tables;
    let typ1 = result[ID - 1].types;
    let typ2 = result[ID].types;
    let col1 = result[ID - 1].columns;
    let col2 = result[ID].columns;
    let cst1 = result[ID - 1].constraints;
    let cst2 = result[ID].constraints;

    let pol1 = result[ID - 1].policies;
    let pol2 = result[ID].policies;
    let pgt1 = result[ID - 1].pg_types;
    let pgt2 = result[ID].pg_types;
    let fns1 = result[ID - 1].functions;
    let fns2 = result[ID].functions;
    let trg1 = result[ID - 1].triggers;
    let trg2 = result[ID].triggers;
    let vue1 = result[ID - 1].views;
    let vue2 = result[ID].views;

    const ca = compareArrays(tbl1, tbl2);
    const cb = compareArrays(typ1, typ2);
    const cc = compareArrays(col1, col2);
    const cd = compareConstraintsArrays(cst1, cst2);
    const ce = compareArrays(pol1, pol2);
    const cf = compareArrays(fns1, fns2);
    const cg = compareArrays(trg1, trg2);
    const ch = compareArrays(vue1, vue2);
    const cz = compareArrays(pgt1, pgt2);

    let qp = {
      up: [],
      down: [],
      from: {
        types: typ1,
        tables: tbl1,
        columns: col1,
        constraints: cst1,
        policies: pol1,
        functions: fns1,
        triggers: trg1,
        views: vue1,
      },
      to: {
        types: typ2,
        tables: tbl2,
        columns: col2,
        constraints: cst1,
        policies: pol2,
        functions: fns2,
        triggers: trg2,
        views: vue2,
      },
    };
    query(sql.types(), (err, result) => {
      const organizeSqlCommands = (commands) => {
        const createTableCommands = [];
        const otherCommands = [];
        const dropTableCommands = [];

        for (let command of commands) {
          if (command.startsWith('CREATE TABLE')) {
            createTableCommands.push(command);
          } else if (command.startsWith('DROP TABLE')) {
            dropTableCommands.push(command);
          } else {
            otherCommands.push(command);
          }
        }

        return [...createTableCommands, ...otherCommands, ...dropTableCommands];
      };

      const pg_types = result;

      qp.drops = [];
      qp = generateTypeSQL(schema, qp, cb, new_schema);
      qp = generateTableSQL(schema, qp, ca, new_schema);
      qp = generateColumnSQL(schema, qp, cc, new_schema);
      qp = generateConstraintsSQL(schema, qp, cd, new_schema);
      qp = generateViewsSQL(schema, qp, ch, new_schema);
      qp = generatePoliciesSQL(schema, qp, ce, new_schema);
      qp = generateFunctionsSQL(schema, pg_types, qp, cf, new_schema);
      qp = generateTriggersSQL(schema, qp, cg, new_schema);

      qp.down = qp.down.reverse();
      qp.up = organizeSqlCommands(qp.up);
      qp.down = organizeSqlCommands(qp.down);

      let migrate = [];
      delete qp.from;
      delete qp.to;
      delete qp.drops;

      if (!(qp.up.length == 0 && qp.down.length == 0)) {
        migrate.push('\n------  up  ------\n', qp.up.join('\n'), '\n');
        migrate.push('\n------ down ------\n', qp.down.join('\n'), '\n\n');
        const o = {
          up: qp.up,
          down: qp.down,
        };
        fs.mkdir(`${__dirname}/../db/migrate`, { recursive: true }, (err) => {
          const filename =
            migration_date
              .toISOString()
              .replace(/[^a-zA-Z0-9]/g, '')
              .replace(/T/g, '')
              .replace(/Z/g, '') +
            '_' +
            migration_id +
            '.json';
          const migrate_script = migrate.join('\n');
          fs.writeFile(
            `${__dirname}/../db/migrate/${filename}`,
            JSON.stringify(o, null, 4),
            () => {
              update_last_migration(migration_id, callback);
            }
          );
        });
      } else {
        query(
          `delete from history.migrations where id='${migration_id}'`,
          callback
        );
      }
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

// See if it exists a snapshot for this migration
fs.access(lockFilePath, (err, result) => {
  if (result) {
    console.log('** another migration is running');
    return process.exit(0);
  }
  fs.writeFile(lockFilePath, '**', (err) => {
    run_schema(() => {
      const initSnapshot = () => {
        const uuid = uuidv4();
        // on lance le process snapshot pour créer le init
        console.log('Creating init snapshot...');
        query(
          `insert into history.last_migration (state_id) values ('${uuid}')`,
          (err) => {
            exec('npm run db:snapshot init', (err, stdout, stderr) => {
              fs.unlink(lockFilePath, () => {
                console.log('done.');
                process.exit(0);
              });
            });
          }
        );
      };
      query(
        `SELECT state_id from history.last_migration where state_id is not null`,
        (err, result) => {
          if (result.length == 0 && !Init) {
            console.log(
              'This is not your master database or master database not initialized.\nPlease run npm run db:snapshot --init (or yarn db:snapshot --init) to initialize your master database.'
            );
            fs.unlink(lockFilePath, () => {
              console.log('done.');
              process.exit(0);
            });
            return;
          }
          if (Init && result.length > 0) {
            console.log('Your master database is already initialized.');
            fs.unlink(lockFilePath, () => {
              console.log('done.');
              process.exit(0);
            });
            return;
          }

          if (Init) {
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
                      if (err) return initSnapshot();
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

                      executeQueries(commands, 0, initSnapshot);
                    }
                  );
                });
              }
            );
          }

          query(q.tables, (err, tables) => {
            if (err) {
              return fs.unlink(lockFilePath, () => {
                console.log(err.message);
              });
            }
            let tbl = {};
            let cols = {};
            for (let i = 0; i < tables.length; i++)
              tbl[tables[i].id] = tables[i];
            query(q.columns, (err, columns) => {
              if (err) {
                return fs.unlink(lockFilePath, () => {
                  console.log(err.message);
                });
              }
              for (let i = 0; i < columns.length; i++) {
                if (columns[i].id.split('.')[1] * 1 > 0) {
                  if (tbl[columns[i].id.split('.')[0]]) {
                    cols[columns[i].id] = columns[i];
                  }
                }
              }
              query(q.constraints, (err, constraints) => {
                if (err) {
                  return fs.unlink(lockFilePath, () => {
                    console.log(err.message);
                  });
                }
                let cstr = {};
                for (let i = 0; i < constraints.length; i++) {
                  let constraint = constraints[i];
                  const id = search(tbl, { name: constraint.table_name }, [
                    'id',
                  ]);
                  if (!cstr[id]) cstr[id] = [];
                  cstr[id].push(constraint);
                }
                query(q.types, (err, types) => {
                  if (err) {
                    return fs.unlink(lockFilePath, () => {
                      console.log(err.message);
                    });
                  }
                  let typ = {};
                  let pgtyp = {};
                  for (let i = 0; i < types.length; i++)
                    typ[types[i].id] = types[i];
                  query(q.pg_types, (err, pgtypes) => {
                    let pg_types = {};
                    if (err) {
                      return fs.unlink(lockFilePath, () => {
                        console.log(err.message);
                      });
                    }
                    for (let i = 0; i < pgtypes.length; i++)
                      pgtyp[pgtypes[i].id] = pgtypes[i];
                    query(q.policies, (err, mypolicies) => {
                      if (err) {
                        return fs.unlink(lockFilePath, () => {
                          console.log(err.message);
                        });
                      }
                      let policies = {};
                      for (let i = 0; i < mypolicies.length; i++)
                        policies[mypolicies[i].id] = mypolicies[i];
                      query(q.functions, (err, myfunctions) => {
                        if (err) {
                          return fs.unlink(lockFilePath, () => {
                            console.log(err.message);
                          });
                        }
                        let functions = {};
                        for (let i = 0; i < myfunctions.length; i++)
                          functions[myfunctions[i].id] = myfunctions[i];
                        query(q.triggers, (err, trigs) => {
                          if (err) {
                            return fs.unlink(lockFilePath, () => {
                              console.log(err.message);
                            });
                          }
                          let triggers = {};
                          for (let i = 0; i < trigs.length; i++)
                            triggers[trigs[i].id] = trigs[i];
                          query(q.views, (err, v) => {
                            if (err) {
                              return fs.unlink(lockFilePath, () => {
                                console.log(err.message);
                              });
                            }
                            let views = {};
                            for (let i = 0; i < v.length; i++)
                              views[v[i].id] = v[i];
                            const SQL = `INSERT INTO history.migrations ("title", "tables", "columns", "constraints", "types", "pg_types", "policies", "functions", "triggers", "views") VALUES ('${name}', '${JSON.stringify(
                              tbl
                            )}', '${jsonString(cols)}', '${jsonString(
                              cstr
                            )}', '${jsonString(typ)}', '${jsonString(
                              pgtyp
                            )}', '${jsonString(policies)}', '${jsonString(
                              functions
                            )}', '${jsonString(triggers)}', '${jsonString(
                              views
                            )}') RETURNING id,createdat;`;
                            query(SQL, (err, s) => {
                              if (err) {
                                return fs.unlink(lockFilePath, () => {
                                  console.log(err.message);
                                });
                              }
                              const migration_id = s[0].id;
                              const migration_date = s[0].createdat;
                              if (name != 'init')
                                generateMigrateScript(
                                  migration_id,
                                  migration_date,
                                  () => {
                                    console.log('all done.');
                                    fs.unlink(lockFilePath, () => {
                                      process.exit(0);
                                    });
                                  }
                                );
                              else {
                                update_last_migration(migration_id, () => {
                                  const filename =
                                    new Date()
                                      .toISOString()
                                      .replace(/[^a-zA-Z0-9]/g, '')
                                      .replace(/T/g, '')
                                      .replace(/Z/g, '') +
                                    '_' +
                                    migration_id +
                                    '.json';
                                  fs.writeFile(
                                    __dirname + '/../db/migrate/' + filename,
                                    JSON.stringify({ init: true }, null, 4),
                                    () => {
                                      console.log('all done.');
                                      fs.unlink(lockFilePath, () => {
                                        db.close();
                                        process.exit(0);
                                      });
                                    }
                                  );
                                });
                              }
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        }
      );
    });
  });
});
