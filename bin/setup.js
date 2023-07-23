require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');

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
    `${__dirname}/../client/src/environments/environment.ts`,
    result
  );
  if (process.env.CLIENT_production == true)
    fs.writeFileSync(
      `${__dirname}/../client/src/environments/environment.prod.ts`,
      result
    );
};

if (!process.env.DEV || JSON.parse(process.env.DEV) === false)
  process.env.CLIENT_production = true;
if (process.env.DEV && JSON.parse(process.env.DEV) === true)
  process.env.CLIENT_production = false;

if (process.env.DEV && JSON.parse(process.env.DEV) === true) {
  process.env.CLIENT_production = false;
} else {
  process.env.CLIENT_production = true;
}

if (process.env.CI_CLIENT_ID) {
  process.env['CLIENT_clientId'] = process.env['CI_CLIENT_ID'];
  process.env['CLIENT_orionUrl'] = process.env['CI_ORION_URI'];
  process.env['CLIENT_redirectUri'] =
    process.env['CI_ENVIRONMENT_URL'] + '/login';
  process.env['CLIENT_allowedUrls'] =
    '["' +
    process.env['CI_ENVIRONMENT_URL'] +
    '/api' +
    '","' +
    process.env['CI_ENVIRONMENT_URL'] +
    '/db' +
    '"]';
  process.env['CLIENT_serverDbUrl'] = process.env['CI_ENVIRONMENT_URL'] + '/db';
  process.env['CLIENT_serverApiUrl'] =
    process.env['CI_ENVIRONMENT_URL'] + '/api';
  process.env['CLIENT_deconnexionUri'] =
    process.env['CI_ENVIRONMENT_URL'] + '/deconnexion';
}

generateAngularEnvironment();
