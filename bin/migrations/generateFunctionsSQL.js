module.exports = (schema, pgtypes, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;
  let pg_types = {};
  for (let i = 0; i < pgtypes.length; i++)
    pg_types[pgtypes[i].id] = pgtypes[i].format;
  function createFunctionSQL(functionObj) {
    let args = [];
    for (let i = 0; i < functionObj.args.length; i++) {
      args.push(
        //functionObj.args[i].name + ' ' + pg_types[functionObj.args[i].type_id]
        functionObj.args[i].name + ' ' + pg_types[functionObj.args[i].type_id]
      );
    }
    functionObj.schema = new_schema;
    let sql = 'CREATE OR REPLACE FUNCTION ';

    // Add schema and function name
    sql += `${functionObj.schema}.${functionObj.name}(${args.join(', ')})`;

    // Add returns and language
    sql += ` RETURNS ${functionObj.return_type}`;

    // Add AS and definition
    sql +=
      ' AS $$' +
      functionObj.definition +
      ' $$ ' +
      `LANGUAGE ${functionObj.language}`;
    // Add security definer if it is true
    if (functionObj.security_definer) {
      sql += ' SECURITY DEFINER';
    }
    return sql + ';';
  }
  function dropFunctionSQL(functionObj) {
    let sql = 'DROP FUNCTION IF EXISTS ';

    // Add schema and function name
    sql += `${functionObj.schema}.${functionObj.name}() CASCADE;`;

    return sql;
  }
  /** CREATE */
  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    q.up.push(createFunctionSQL(obj));
    q.drops.push(dropFunctionSQL(obj));
  }
  return q;
};
