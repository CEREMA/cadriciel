module.exports = (schema, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;
  const KEYWORDS = ['::', '()'];
  const getKeyword = (str) => {
    for (let i = 0; i < KEYWORDS.length; i++) {
      if (str.indexOf(KEYWORDS[i]) > -1) return true;
    }
    return false;
  };
  /** CREATE */
  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];
    let data_type = obj.data_type;
    if (data_type == 'USER-DEFINED') data_type = obj.format;
    q.up.push(
      `ALTER TABLE "${new_schema}"."${obj.table}" ADD "${obj.name}" ${data_type};`
    );
    q.down.push(
      `ALTER TABLE "${new_schema}"."${obj.table}" DROP COLUMN "${obj.name}";`
    );
    if (obj.comment) {
      q.up.push(
        `COMMENT ON COLUMN "${new_schema}"."${obj.table}"."${obj.name}" IS '${obj.comment}';`
      );
      q.down.push(
        `COMMENT ON COLUMN "${new_schema}"."${obj.table}"."${obj.name}" IS null;`
      );
    }
    if (obj.is_nullable === false) {
      q.up.push(
        `ALTER TABLE "${new_schema}"."${obj.table}" ALTER COLUMN "${obj.name}" SET NOT NULL;`
      );
    }
    if (obj.default_value) {
      let default_value = obj.default_value;
      if (getKeyword(obj.default_value) == true)
        default_value = obj.default_value;
      else {
        default_value = `'${obj.default_value}'`;
      }

      q.up.push(
        `ALTER TABLE "${new_schema}"."${obj.table}" ALTER COLUMN "${obj.name}" SET DEFAULT ${default_value};`
      );
      q.down.push(
        `ALTER TABLE "${new_schema}"."${obj.table}" ALTER COLUMN "${obj.name}" DROP DEFAULT;`
      );
    }
  }

  /** UPDATE */
  for (let i = 0; i < o.updated.length; i++) {
    const obj = o.updated[i];
    let tb_from, col_from, tb_to, col_to;

    if (obj.name) {
      tb_from = q.from.tables[obj.name.id.split('.')[0]];
      col_from = q.from.columns[obj.name.id];
      tb_to = q.to.tables[obj.name.id.split('.')[0]];
      col_to = q.to.columns[obj.name.id];
    }
    if (obj.table) {
      tb_from = q.from.tables[obj.table.id.split('.')[0]];
      col_from = q.from.columns[obj.table.id];
      tb_to = q.to.tables[obj.table.id.split('.')[0]];
      col_to = q.to.columns[obj.table.id];
    }

    if (col_from.name != col_to.name) {
      q.up.push(
        `ALTER TABLE "${new_schema}"."${tb_to.name}" RENAME COLUMN "${col_from.name}" TO "${col_to.name}";`
      );
      q.down.push(
        `ALTER TABLE "${new_schema}"."${tb_to.name}" RENAME COLUMN "${col_to.name}" TO "${col_from.name}";`
      );
    }
    if (col_from.data_type != col_to.data_type) {
      q.up.push(
        `ALTER TABLE "${new_schema}"."${tb_to.name}" ALTER COLUMN "${col_to.name}" TYPE ${col_to.data_type};`
      );
      q.down.push(
        `ALTER TABLE "${new_schema}"."${tb_to.name}" ALTER COLUMN "${col_to.name}" TYPE ${col_from.data_type};`
      );
    }
  }

  /** DELETE */
  for (let i = 0; i < o.deleted.length; i++) {
    const obj = o.deleted[i];
    let data_type = obj.data_type;
    if (data_type == 'USER-DEFINED') data_type = obj.format;

    q.up.push(
      `ALTER TABLE "${new_schema}"."${obj.table}" DROP COLUMN "${obj.name}";`
    );
    q.down.push(
      `ALTER TABLE "${new_schema}"."${obj.table}" ADD "${obj.name}" ${data_type};`
    );
    if (obj.comment) {
      q.down.push(
        `COMMENT ON COLUMN "${new_schema}"."${obj.table}"."${obj.name}" IS '${obj.comment}';`
      );
    }
    if (obj.is_nullable === false) {
      q.down.push(
        `ALTER TABLE "${new_schema}"."${obj.table}" ALTER COLUMN "${obj.name}" SET NOT NULL;`
      );
    }
    if (obj.default_value) {
      let default_value = obj.default_value;
      if (getKeyword(obj.default_value) == true)
        default_value = obj.default_value;
      else default_value = `'${obj.default_value}'`;

      q.down.push(
        `ALTER TABLE "${new_schema}"."${obj.table}" ALTER COLUMN "${obj.name}" SET DEFAULT ${default_value};`
      );
    }
  }

  return q;
};
