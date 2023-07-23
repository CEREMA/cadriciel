WITH selected_migration AS (
  SELECT
    *
  FROM
    history.migrations
  WHERE
    id = '${migration_id}'
)
SELECT
  *
FROM
  (
    SELECT
      *
    FROM
      history.migrations
    WHERE
      createdat <= (
        SELECT
          createdat
        FROM
          selected_migration
      )
    ORDER BY
      createdat desc 
    LIMIT
      2
  ) subquery order by createdat