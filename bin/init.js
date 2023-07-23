require('dotenv').config();
const url = require('url');
const fs = require('fs');
const path = require('path');

function parsePostgresUrl(pgUrl) {
  let result = {};

  // Analyser l'URL
  let parsedUrl = new url.URL(pgUrl);

  // Extraire et assigner les valeurs
  result.host = parsedUrl.hostname;
  result.port = parsedUrl.port;
  result.username = parsedUrl.username;
  result.password = parsedUrl.password;
  result.database = parsedUrl.pathname.split('/')[1]; // supprime le premier caractère slash

  return result;
}

if (!process.env.DB_URI) return false;
const dbConfig = parsePostgresUrl(process.env.DB_URI);
const SequelizeAuto = require('sequelize-auto');
const Sequelize = require('sequelize', { logging: false });
const sequelize = new Sequelize(process.env.DB_URI);

const {
  ModelBuilder,
  DialectPostgres,
} = require('sequelize-typescript-generator');

const options = {
  dialect: 'postgres',
  directory: __dirname + '/../db/models',
  camelCase: false,
  camelCaseForFileName: false,
  schema: 'public',
  views: true,
};

const auto = new SequelizeAuto(sequelize, null, null, options);
auto.run();

(async () => {
  const config = {
    connection: {
      dialect: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      username: dbConfig.username,
      password: dbConfig.password,
    },
    metadata: {
      indices: true,
      case: 'underscore',
    },
    output: {
      clean: true,
      outDir: __dirname + '/../client/src/app/main/interfaces',
    },
    strict: true,
  };

  const dialect = new DialectPostgres();

  const builder = new ModelBuilder(config, dialect);

  try {
    await builder.build();
    const dir = __dirname + '/../client/src/app/main/interfaces';
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fileDir = path.join(dir, file);
      let script = fs.readFileSync(fileDir, 'utf-8');
      try {
        script = script.split('export interface')[1].split('}')[0];
        script = 'export interface ' + script + '}';
        script = script.replace('Attributes', '');
        fs.writeFileSync(fileDir, script);
      } catch (e) {}
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
