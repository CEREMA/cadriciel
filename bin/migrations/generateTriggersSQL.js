module.exports = (schema, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;

  function createTriggerSQL(triggerObj) {
    triggerObj.function_schema = new_schema;

    // Start with the CREATE TRIGGER command
    let sql = `CREATE OR REPLACE TRIGGER ${triggerObj.name}\n`;

    // Add activation
    sql += `${triggerObj.activation} `;

    // Add events
    sql += triggerObj.events.join(' OR ') + '\n';

    // Add orientation and table
    sql += `ON ${triggerObj.schema}.${triggerObj.table}\n`;

    // Add FOR EACH statement for trigger orientation
    sql += `FOR EACH ${triggerObj.orientation} `;

    // Add the trigger function
    sql += `EXECUTE PROCEDURE ${triggerObj.function_schema}.${triggerObj.function_name}();`;

    return sql;
  }
  /** CREATE */

  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    q.up.push(createTriggerSQL(obj));
    q.down.push(
      `DROP TRIGGER IF EXISTS ${obj.name} ON ${new_schema}.${obj.table};`
    );
  }
  return q;
};
