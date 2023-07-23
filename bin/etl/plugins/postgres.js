module.exports = (config, map) => {
  const mapTypes = (value) => {
    switch (value) {
      case 'number':
        // Check if value has a decimal part to differentiate between INT and DECIMAL
        return Number.isInteger(value) ? 'INT' : 'DECIMAL';
      case 'string':
        return 'VARCHAR(255)';
      case 'json':
        return 'JSONB';
      case 'int':
        return 'INT';
      case 'bigint':
        return 'BIGINT';
      case 'boolean':
        return 'BOOLEAN';
      default:
        return 'VARCHAR(255)';
    }
  };

  // Extract keys from the first row and determine their types
  let columns = [];
  map.fields.forEach((element) => {
    for (let el in element)
      return columns.push(`${el} ${mapTypes(element[el])}`);
  });

  // Add id, createdAt, updatedAt fields
  columns.unshift('id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid ()');
  columns.push('createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()');
  columns.push('updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()');

  // Create the table
  let createTableSql = `
CREATE TABLE public.${config.table}(
  ${columns.join(',\n  ')}
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON ${config.table}
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
`;

  // Create INSERT statements
  let insertSql = map.data
    .map((row) => {
      let keys = Object.keys(row);
      let values = keys.map((key) => {
        // Check if the value is not null or undefined before converting to string
        return row[key] !== null && row[key] !== undefined
          ? `'${row[key].toString().replace(/'/g, "''")}'`
          : 'NULL';
      });

      return `INSERT INTO public.${config.table}(${keys.join(
        ', '
      )}) VALUES (${values.join(', ')});`;
    })
    .join('\n');

  return {
    create: createTableSql,
    insert: insertSql,
  };
};
