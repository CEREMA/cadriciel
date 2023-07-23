module.exports = (schema, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;

  /** CREATE */
  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    if (obj.enums != '') {
      q.up.push(
        `CREATE TYPE "${new_schema}"."${obj.name}" AS ENUM ('${obj.enums.join(
          "','"
        )}');`
      );
      q.down.push(`DROP TYPE "${new_schema}"."${obj.name}";`);
    }
    if (obj.comment) {
      q.up.push(
        `COMMENT ON TYPE "${new_schema}"."${obj.name}" IS '${obj.comment}';`
      );
      q.down.push(`COMMENT ON TYPE "${new_schema}"."${obj.name}" IS NULL;`);
    }
  }
  /** UPDATE */
  for (let i = 0; i < o.updated.length; i++) {
    const obj = o.updated[i];

    if (obj.enums) {
      const initial_type = q.from.types[obj.enums.id];
      const to_type = q.to.types[obj.enums.id];
      const initial_enums = initial_type.enums;
      const to_enums = to_type.enums;
      const diff_arr = cArrays(initial_enums, to_enums);
      for (let i = 0; i < diff_arr.create.length; i++) {
        q.up.push(
          `ALTER TYPE "${new_schema}"."${to_type.name}" ADD VALUE "${diff_arr.create[i]}";`
        );
        q.down.push(
          `ALTER TYPE "${new_schema}"."${initial_type.name}" DROP ATTRIBUTE "${diff_arr.create[i]}";`
        );
      }
      for (let i = 0; i < diff_arr.update.length; i++) {
        const from = diff_arr.update[i].from;
        const to = diff_arr.update[i].to;
        if (from !== to) {
          q.up.push(
            `ALTER TYPE "${new_schema}"."${to_type.name}" RENAME VALUE '${from}' TO '${to}';`
          );
          q.down.push(
            `ALTER TYPE "${new_schema}"."${initial_type.name}" RENAME VALUE '${to}' TO '${from}';`
          );
        }
      }
      for (let i = 0; i < diff_arr.delete.length; i++) {
        q.up.push(
          `ALTER TYPE "${new_schema}"."${to_type.name}" DROP ATTRIBUTE "${diff_arr.create[i]}";`
        );
        q.down.push(
          `ALTER TYPE "${new_schema}"."${initial_type.name}" ADD VALUE '${diff_arr.create[i]}';`
        );
      }
    }
    if (obj.name) {
      const initial_type = q.from.types[obj.name.id];
      const to_type = q.to.types[obj.name.id];
      q.up.push(
        `ALTER TYPE "${new_schema}"."${initial_type.name}" RENAME TO ${to_type.name};`
      );
      q.down.push(
        `ALTER TYPE "${new_schema}"."${to_type.name}" RENAME TO ${initial_type.name};`
      );
    }
    if (obj.comment) {
      const initial_type = q.from.types[obj.comment.id];
      const to_type = q.to.types[obj.comment.id];
      let comment;
      if (obj.comment.props.to === null) comment = `${obj.comment.props.to}`;
      else comment = `'${obj.comment.props.to}'`;
      q.up.push(
        `COMMENT ON TYPE "${new_schema}"."${to_type.name}" IS ${comment};`
      );
      if (obj.comment.props.from === null)
        comment = `${obj.comment.props.from}`;
      else comment = `'${obj.comment.props.from}'`;
      q.down.push(
        `COMMENT ON TYPE "${new_schema}"."${to_type.name}" IS ${comment};`
      );
    }
  }
  /** DELETE */
  for (let i = 0; i < o.deleted.length; i++) {
    const obj = o.deleted[i];
    const initial_type = q.from.types[obj.id];
    q.up.push(`DROP TYPE "${new_schema}"."${o.deleted[i].name}" CASCADE;`);
    if (initial_type.enums)
      q.down.push(
        `CREATE TYPE "${new_schema}"."${
          initial_type.name
        }" AS ENUM ('${initial_type.enums.join("','")}');`
      );
    if (initial_type.comment)
      q.up.push(
        `COMMENT ON TYPE "${new_schema}"."${initial_type.name}" IS '${initial_type.comment}';`
      );
  }
  return q;
};
