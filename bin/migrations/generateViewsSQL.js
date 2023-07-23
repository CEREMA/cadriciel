module.exports = (schema, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;
  /** CREATE */
  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    q.up.push(
      `CREATE VIEW "${new_schema}"."${obj.name}" AS ${obj.view_definition}`
    );
    if (obj.comment) {
      q.up.push(
        `COMMENT ON VIEW "${new_schema}"."${obj.name}" IS '${obj.comment}';`
      );
      q.down.push(`COMMENT ON VIEW "${new_schema}"."${obj.name}" IS NULL;`);
    }
    q.down.push(`DROP VIEW "${new_schema}"."${obj.name}";`);
  }
  /** DELETE */
  for (let i = 0; i < o.deleted.length; i++) {
    const obj = o.deleted[i];
    console.log(obj);
    q.up.push(`DROP VIEW "${new_schema}"."${obj.name}";`);
    q.down.push(
      `CREATE VIEW "${new_schema}"."${obj.name}" AS ${obj.view_definition}`
    );
  }
  return q;
};
