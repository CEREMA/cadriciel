const fs = require('fs');
const path = require('path');

const dir = fs.readdirSync(__dirname);
const parse = () => {
  let sql = {};
  dir.forEach((file) => {
    if (file === 'index.js') return;
    const name = file.split('.')[0];
    sql[name] = fs.readFileSync(path.join(__dirname, file), 'utf-8');
  });
  return sql;
};

module.exports = parse;
