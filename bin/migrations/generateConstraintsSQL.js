module.exports = (schema, q, o, new_schema) => {
  if (!new_schema) new_schema = schema;

  /** CREATE */
  let drop_constraints = [];
  let pk_constraints = [];
  let uk_constraints = [];
  let fk_constraints = [];
  let ck_constraints = [];

  for (let i = 0; i < o.created.length; i++) {
    const obj = o.created[i];

    /** primary key */
    if (obj.constraint_type == 'p') {
      pk_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" ADD CONSTRAINT ${
          obj.constraint_name
        } PRIMARY KEY (${obj.column_names.replace(/{|}/g, '')});`
      );
      drop_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" DROP CONSTRAINT IF EXISTS ${obj.constraint_name};`
      );
    }
    /** check key */
    if (obj.constraint_type == 'c') {
      ck_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" ADD CONSTRAINT ${obj.constraint_name} CHECK (${obj.check_clause});`
      );
      drop_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" DROP CONSTRAINT IF EXISTS ${obj.constraint_name};`
      );
    }
    /** unique key */
    if (obj.constraint_type == 'u') {
      uk_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" ADD CONSTRAINT ${
          obj.constraint_name
        } UNIQUE (${obj.column_names.replace(/{|}/g, '')});`
      );
      drop_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" DROP CONSTRAINT IF EXISTS ${obj.constraint_name};`
      );
    }
    /** foreign key */
    if (obj.constraint_type == 'f') {
      if (obj.foreign_table_schema == schema)
        obj.foreign_table_schema = new_schema;
      fk_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" ADD CONSTRAINT "${
          obj.constraint_name
        }" FOREIGN KEY ("${obj.column_names.replace(/{|}/g, '')}") REFERENCES ${
          obj.foreign_table_schema
        }.${obj.foreign_table_name} (${obj.foreign_column_names.replace(
          /{|}/g,
          ''
        )});`
      );
      drop_constraints.push(
        `ALTER TABLE "${new_schema}"."${obj.table_name}" DROP CONSTRAINT IF EXISTS ${obj.constraint_name};`
      );
    }
  }

  for (let i = 0; i < drop_constraints.length; i++)
    q.down.push(drop_constraints[i]);
  for (let i = 0; i < pk_constraints.length; i++) q.up.push(pk_constraints[i]);
  for (let i = 0; i < uk_constraints.length; i++) q.up.push(uk_constraints[i]);
  for (let i = 0; i < ck_constraints.length; i++) q.up.push(ck_constraints[i]);
  for (let i = 0; i < fk_constraints.length; i++) q.up.push(fk_constraints[i]);

  /** UPDATE */
  /*
  for (let i = 0; i < o.updated.length; i++) {
    const obj = o.updated[i];
    q.up.push(
      `ALTER TABLE "${new_schema}"."${obj.table_name}" ALTER COLUMN "${obj.column_name}" SET DATA TYPE ${obj.new_data_type};`
    );
  }
*/
  /** DELETE */
  /*for (let i = 0; i < o.deleted.length; i++) {
    const obj = o.deleted[i];
    q.down.push(
      `ALTER TABLE "${new_schema}"."${obj.table_name}" DROP CONSTRAINT IF EXISTS ${obj.constraint_name};`
    );
  }
*/
  return q;
};
