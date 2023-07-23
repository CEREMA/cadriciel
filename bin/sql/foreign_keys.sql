SELECT
  n.nspname as schema_name,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS foreign_table_name,
  af.attname AS foreign_column_name
FROM
  pg_attribute a 
JOIN
  pg_constraint con ON con.conrelid = a.attrelid AND a.attnum = ANY(con.conkey)
LEFT JOIN
  pg_attribute af ON af.attnum = con.confkey[1] AND af.attrelid = con.confrelid
JOIN 
  pg_class cl ON cl.oid = con.conrelid
JOIN
  pg_namespace n ON n.oid = cl.relnamespace
WHERE
  con.confrelid > 0
ORDER BY
  schema_name,
  table_name, 
  constraint_name;