const _ = require('lodash');
const fs = require('fs');

const queryData = (data, params, fields) => {
  let results = data;

  // Filter by parameters
  if (params) {
    results = results.filter((item) => {
      return Object.keys(params).every((key) => {
        return item[key] === params[key];
      });
    });
  }

  // Select fields
  if (fields) {
    results = results.map((item) => {
      const selected = {};
      fields.forEach((field) => {
        selected[field] = item[field];
      });
      return selected;
    });
  }

  return results;
};

const dbTypes = (type) => {
  if (type === 'bool') type = 'boolean';
  else if (type === 'text') type = 'text';
  else if (type === 'string') type = 'varchar(255)';
  else if (type === 'int') type = 'integer';
  else if (type === 'bigint') type = 'bigint';
  else if (type === 'smallint') type = 'smallint';
  else if (type === 'decimal') type = 'decimal';
  else if (type === 'numeric') type = 'numeric';
  else if (type === 'real') type = 'real';
  else if (type === 'double') type = 'double precision';
  else if (type === 'date') type = 'date';
  else if (type === 'time') type = 'time';
  else if (type === 'timestamp') type = 'timestamp';
  else if (type === 'timestamptz') type = 'timestamp with time zone';
  else if (type === 'interval') type = 'interval';
  else if (type === 'json') type = 'json';
  else if (type === 'jsonb') type = 'jsonb';
  else if (type === 'uuid') type = 'uuid';
  else if (type === 'geography') type = 'geography';
  else if (type === 'point') type = 'point';
  else if (type === 'line') type = 'line';
  else if (type === 'lseg') type = 'lseg';
  else if (type === 'box') type = 'box';
  else if (type === 'path') type = 'path';
  else if (type === 'polygon') type = 'polygon';
  else if (type === 'circle') type = 'circle';
  return type;
};

const compareArrays = (oldArray, newArray) => {
  const created = [];
  const updated = [];
  const deleted = [];

  // Compare objects in the new array with the old array
  for (const newObj of newArray) {
    const matchingObj = oldArray.find((oldObj) => oldObj.id === newObj.id);

    if (matchingObj) {
      // Object exists in both arrays, check for updates
      const updatedProperties = {};
      let hasUpdates = false;

      for (const key in newObj) {
        if (!_.isEqual(newObj[key], matchingObj[key])) {
          updatedProperties[key] = {
            from: matchingObj[key],
            to: newObj[key],
          };
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        const updateInfo = {
          id: newObj.id,
          name: matchingObj.name,
          schema: matchingObj.schema,
          updatedProperties,
        };

        updated.push(updateInfo);
      }
    } else {
      // Object doesn't exist in the old array, it's a new object
      created.push(newObj);
    }
  }

  // Find deleted objects by comparing IDs
  for (const oldObj of oldArray) {
    const matchingObj = newArray.find((newObj) => oldObj.id === newObj.id);

    if (!matchingObj) {
      // Object doesn't exist in the new array, it's deleted
      deleted.push(oldObj);
    }
  }

  return { created, updated, deleted };
};

const compareConstraintsArrays = (oldArray, newArray) => {
  const created = _.differenceWith(newArray, oldArray, _.isEqual);
  const deleted = _.differenceWith(oldArray, newArray, _.isEqual);
  const commonItems = _.intersectionWith(
    newArray,
    oldArray,
    (newItem, oldItem) => newItem.constraint_name === oldItem.constraint_name
  );
  const updated = commonItems.filter((newItem) => {
    const oldItem = oldArray.find(
      (i) => i.constraint_name === newItem.constraint_name
    );
    return !_.isEqual(newItem, oldItem);
  });

  return {
    created,
    updated,
    deleted,
  };
};

module.exports = {
  queryData,
  dbTypes,
  compareArrays,
  compareConstraintsArrays,
};
