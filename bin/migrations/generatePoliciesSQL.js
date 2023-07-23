module.exports = (schema, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;

  /** CREATE */
  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    let cmd = `CREATE POLICY "${obj.name}" ON "${new_schema}"."${obj.table}" FOR ${obj.command}`;
    if (obj.definition) cmd += ` USING (${obj.definition})`;
    if (obj.check) cmd += ` WITH CHECK (${obj.check})`;
    cmd += ';';
    q.up.push(cmd);
    q.down.push(`DROP POLICY "${obj.name}" ON "${new_schema}"."${obj.table}";`);
  }
  /** UPDATE */
  for (let i = 0; i < o.updated.length; i++) {
    const obj = o.updated[i];
  }
  /** DELETE */
  for (let i = 0; i < o.deleted.length; i++) {
    const obj = o.deleted[i];
    console.log('deleted->', obj);
    q.down.push(
      `CREATE POLICY ${obj.name} ON ${new_schema}.${obj.table} FOR ${obj.command} TO ${obj.roles};`
    );
    q.drops.policies.push(
      `DROP POLICY ${obj.name} ON ${new_schema}.${obj.table};`
    );
  }
  return q;
};
