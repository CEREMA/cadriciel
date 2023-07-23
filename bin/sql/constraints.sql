SELECT
  n.nspname AS schema,
  c.relname AS table_name,
  conname AS constraint_name,
  contype AS constraint_type,
  conrelid::regclass AS relation,
  ARRAY(
    SELECT attname
    FROM unnest(con.conkey) AS u(attnum)
    JOIN pg_attribute a ON a.attnum = u.attnum AND a.attrelid = con.conrelid
  ) AS column_names,
  n_foreign.nspname AS foreign_table_schema,
  confrelid::regclass AS foreign_table_name,
  ARRAY(
    SELECT attname
    FROM unnest(con.confkey) AS u(attnum)
    JOIN pg_attribute af ON af.attnum = u.attnum AND af.attrelid = con.confrelid
  ) AS foreign_column_names,
  conbin AS check_condition -- Include the check constraint condition
FROM
  pg_constraint con
JOIN
  pg_class c ON con.conrelid = c.oid
JOIN
  pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN
  pg_class c_foreign ON con.confrelid = c_foreign.oid
LEFT JOIN
  pg_namespace n_foreign ON n_foreign.oid = c_foreign.relnamespace
WHERE
  c.relkind IN ('r','p')
  AND (
    contype = 'p' -- Primary Key
    OR contype = 'f' -- Foreign Key
    OR contype = 'u' -- Unique Constraint
    OR contype = 'c' -- Check Constraint
  )
ORDER BY
  schema,
  table_name,
  constraint_name;
