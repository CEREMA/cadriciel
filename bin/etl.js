const fs = require('fs');
const eliminerLesDoublons = (array) => {
  return [...new Set(array)];
};

const data = require(`${__dirname}/../db/etl/${process.argv[2]}`);

const source = data.source;
const target = data.destination;
const map = data.map;

const flatten = (obj, prefix = '') => {
  const res = {};
  for (let key in obj) {
    let value = obj[key];
    let newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(res, flatten(value, newKey));
    } else {
      res[newKey] = value;
    }
  }
  return res;
};

const mapper = (data, map) => {
  let allfields = false;
  if (map['*']) {
    if (map['*'] === true) allfields = true;
    else allfields = false;
    delete map['*'];
  }
  const mapTypes = (value) => {
    let jsType = typeof value;
    switch (jsType) {
      case 'number':
        // Check if value has a decimal part to differentiate between INT and DECIMAL
        return Number.isInteger(value) ? 'int' : 'decimal';
      case 'string':
        return 'string';
      case 'boolean':
        return 'bool';
      case 'json':
        return 'json';
      default:
        return 'string';
    }
  };
  if (JSON.stringify(map) === '{}') {
    for (let el in data[0]) {
      map[el] = el;
    }
  }

  data = data.map((item) => flatten(item));

  for (let i = 0; i < data.length; i++) {
    for (let key in data[i]) {
      if (map[key]) {
        if (map[key].field) {
          if (map[key].render) {
            data[i][map[key].field] = map[key].render(
              data[i][key],
              data[i],
              data
            );
          } else data[i][map[key].field] = data[i][key];
        } else {
          data[i][map[key]] = data[i][key];
        }
        if (map[key].field) {
          if (key != map[key].field) delete data[i][key];
        }
        if (allfields === false) delete data[i][key];
      } else {
        if (allfields === false) delete data[i][key];
      }
    }
  }

  // Extract keys from the first row and determine their types
  let columns = Object.keys(data[0]).map((key) => {
    for (let el in map) {
      if (map[el].field === key) return { [key]: map[el].type };
    }
    console.log(key);
    return { [key]: mapTypes(data[0][key]) };
  });
  console.log(columns);
  return {
    data: data,
    fields: columns,
  };
};

const data_source = require('./etl/plugins/' + source.plugin)(source.config);

const o = mapper(data_source, map);

const result = require('./etl/plugins/' + target.plugin)(target.config, o);

fs.writeFileSync('bassins.sql', result.create + '\n' + result.insert);
