SELECT
  c.oid::int8 AS id,
  nc.nspname AS schema,
  c.relname AS name,
  obj_description(c.oid) AS comment,
  v.definition AS view_definition
FROM
  pg_namespace nc
  JOIN pg_class c ON nc.oid = c.relnamespace
  LEFT JOIN pg_views v ON nc.nspname = v.schemaname AND c.relname = v.viewname
WHERE
  c.relkind = 'v'
  AND NOT pg_is_other_temp_schema(nc.oid)
  AND (
    pg_has_role(c.relowner, 'USAGE')
    OR has_table_privilege(
      c.oid,
      'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'
    )
    OR has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')
  )

