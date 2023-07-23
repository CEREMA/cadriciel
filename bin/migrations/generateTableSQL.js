module.exports = (schema, q, o, new_schema) => {
  const { queryData } = require('../lib/global');
  if (!new_schema) new_schema = schema;

  /** CREATE */

  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    q.up.push(`CREATE TABLE "${new_schema}"."${obj.name}"();`);
    q.down.push(`DROP TABLE "${new_schema}"."${obj.name}";`);

    if (obj.comment) {
      q.up.push(
        `COMMENT ON TABLE "${new_schema}"."${obj.name}" IS '${obj.comment}';`
      );
      q.down.push(`COMMENT ON TABLE "${new_schema}"."${obj.name}" IS NULL;`);
    }
    if (obj.realtime) {
      if (obj.realtime === true) {
        q.up.push(
          `ALTER PUBLICATION omneedia_realtime ADD TABLE "${new_schema}"."${obj.name}";`
        );
        q.down.push(
          `ALTER PUBLICATION omneedia_realtime DROP TABLE "${new_schema}"."${obj.name}";`
        );
      }

      if (obj.realtime === false) {
        q.up.push(
          `ALTER PUBLICATION omneedia_realtime DROP TABLE "${new_schema}"."${obj.name}";`
        );
        q.down.push(
          `ALTER PUBLICATION omneedia_realtime ADD TABLE "${new_schema}"."${obj.name}";`
        );
      }
    }
    if (obj.rls_enabled) {
      if (obj.rls_enabled === true) {
        q.up.push(
          `ALTER TABLE "${new_schema}"."${obj.name}" ENABLE ROW LEVEL SECURITY;`
        );
        q.down.push(
          `ALTER TABLE "${new_schema}"."${obj.name}" DISABLE ROW LEVEL SECURITY;`
        );
      }

      if (obj.rls_enabled === false) {
        q.up.push(
          `ALTER TABLE "${new_schema}"."${obj.name}" DISABLE ROW LEVEL SECURITY;`
        );
        q.down.push(
          `ALTER TABLE "${new_schema}"."${obj.name}" ENABLE ROW LEVEL SECURITY;`
        );
      }
    }
  }

  /** UPDATE */

  for (let i = 0; i < o.updated.length; i++) {
    const obj = o.updated[i];
    if (obj.name) {
      q.up.push(
        `ALTER TABLE "${new_schema}"."${
          q.from.tables[obj.name.id].name
        }" RENAME TO "${q.to.tables[obj.name.id].name}";`
      );
      q.down.push(
        `ALTER TABLE "${new_schema}"."${
          q.to.tables[obj.name.id].name
        }" RENAME TO "${q.from.tables[obj.name.id].name}";`
      );
    }
    if (obj.comment) {
      if (!obj.comment.props.from) obj.comment.props.from = '';
      q.down.push(
        `COMMENT ON TABLE "${new_schema}"."${
          q.to.tables[obj.comment.id].name
        }" IS '${obj.comment.props.from}';`
      );
      if (!obj.comment.props.to) obj.comment.props.to = '';
      q.up.push(
        `COMMENT ON TABLE "${new_schema}"."${
          q.to.tables[obj.comment.id].name
        }" IS '${obj.comment.props.to}';`
      );
    }
    if (obj.realtime) {
      if (obj.realtime.props.to === true) {
        q.up.push(
          `ALTER PUBLICATION omneedia_realtime ADD TABLE "${new_schema}"."${
            q.to.tables[obj.realtime.id].name
          }";`
        );
        q.down.push(
          `ALTER PUBLICATION omneedia_realtime DROP TABLE "${new_schema}"."${
            q.from.tables[obj.realtime.id].name
          }";`
        );
      }
      if (obj.realtime.props.to === false) {
        q.up.push(
          `ALTER PUBLICATION omneedia_realtime DROP TABLE "${new_schema}"."${
            q.to.tables[obj.realtime.id].name
          }";`
        );
        q.down.push(
          `ALTER PUBLICATION omneedia_realtime ADD TABLE "${new_schema}"."${
            q.from.tables[obj.realtime.id].name
          }";`
        );
      }
    }
    if (obj.rls_enabled) {
      if (obj.rls_enabled.props.to === true) {
        q.up.push(
          `ALTER TABLE "${new_schema}."${
            q.to.tables[obj.rls_enabled.id].name
          }" ENABLE ROW LEVEL SECURITY;`
        );
        q.down.push(
          `ALTER TABLE "${new_schema}"."${
            q.from.tables[obj.rls_enabled.id].name
          }" DISABLE ROW LEVEL SECURITY;`
        );
      }
      if (obj.rls_enabled.props.to === false) {
        q.up.push(
          `ALTER TABLE "${new_schema}"."${
            q.to.tables[obj.rls_enabled.id].name
          }" DISABLE ROW LEVEL SECURITY;`
        );
        q.down.push(
          `ALTER TABLE "${new_schema}"."${
            q.from.tables[obj.rls_enabled.id].name
          }" ENABLE ROW LEVEL SECURITY;`
        );
      }
    }
  }

  /** DELETE */

  for (let i = 0; i < o.deleted.length; i++) {
    const obj = o.deleted[i];
    const initial_table = q.from.tables[obj.id];

    q.up.push(`DROP TABLE "${new_schema}"."${obj.name}";`);
    q.drops.push(obj);

    let down = [];
    down.push(
      `CREATE TABLE "${new_schema}"."${q.from.tables[obj.id].name}"();`
    );
    if (initial_table.comment)
      down.push(
        `COMMENT ON TABLE "${new_schema}"."${q.from.tables[obj.id].name}" IS '${
          obj.comment
        }';`
      );
    if (initial_table.rls_enabled) {
      if (initial_table.rls_enabled === true) {
        down.push(
          `ALTER TABLE "${new_schema}"."${
            q.from.tables[obj.id].name
          }" ENABLE ROW LEVEL SECURITY;`
        );
      }
      if (initial_table.rls_enabled === false) {
        down.push(
          `ALTER TABLE ${new_schema}"."${
            q.from.tables[obj.id].name
          }" DISABLE ROW LEVEL SECURITY;`
        );
      }
    }

    if (initial_table.realtime) {
      if (initial_table.realtime === true) {
        down.push(
          `ALTER PUBLICATION omneedia_realtime ADD TABLE "${new_schema}"."${
            q.from.tables[obj.id].name
          }";`
        );
      }
      if (initial_table.realtime === false) {
        down.push(
          `ALTER PUBLICATION omneedia_realtime DROP TABLE "${new_schema}"."${
            q.from.tables[obj.id].name
          }";`
        );
      }
    }
    q.down.push(down.join('\n'));
  }

  return q;
};
