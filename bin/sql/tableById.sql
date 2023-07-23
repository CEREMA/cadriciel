SELECT n.nspname AS schema_name,
       c.relname AS table_name,
       EXISTS (SELECT 1 FROM pg_publication_tables pt WHERE pt.tablename = c.relname AND pt.schemaname = n.nspname) AS realtime,
       c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.oid = %ID%::regclass;