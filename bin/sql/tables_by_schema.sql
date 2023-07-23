-- schema
SELECT
  c.oid::int8 AS id,
  nc.nspname AS schema,
  c.relname AS name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced,
  CASE
    WHEN c.relreplident = 'd' THEN 'DEFAULT'
    WHEN c.relreplident = 'i' THEN 'INDEX'
    WHEN c.relreplident = 'f' THEN 'FULL'
    ELSE 'NOTHING'
  END AS replica_identity,
  pg_total_relation_size(format('%I.%I', nc.nspname, c.relname))::int8 AS bytes,
  pg_size_pretty(pg_total_relation_size(format('%I.%I', nc.nspname, c.relname))) AS size,
  pg_stat_get_live_tuples(c.oid) AS live_rows_estimate,
  pg_stat_get_dead_tuples(c.oid) AS dead_rows_estimate,
  obj_description(c.oid) AS comment,
  EXISTS (
    SELECT 1
    FROM pg_publication_tables pt
    JOIN pg_publication p ON pt.pubname = p.pubname
    WHERE pt.tablename = c.relname
      AND pt.schemaname = nc.nspname
  ) AS in_publications,
  EXISTS (
    SELECT 1
    FROM pg_publication_tables pt
    JOIN pg_publication p ON pt.pubname = p.pubname
    WHERE pt.tablename = c.relname
      AND pt.schemaname = nc.nspname
  ) AS realtime
FROM
  pg_namespace nc
  JOIN pg_class c ON nc.oid = c.relnamespace
WHERE
  c.relkind IN ('r', 'p')
  AND NOT pg_is_other_temp_schema(nc.oid)
  AND (
    pg_has_role(c.relowner, 'USAGE')
    OR has_table_privilege(
      c.oid,
      'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'
    )
    OR has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES')
  )
  AND nc.nspname = '${schema}'