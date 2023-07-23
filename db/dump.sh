#!/bin/bash

# Variables
DATABASE_HOST="host.docker.internal"
DATABASE_PORT="3535"
DATABASE_USER="postgres"
DATABASE_PASSWORD="postgres"
DATABASE_NAME="postgres"

# Dump schema only
docker run --platform linux/amd64 --rm -ti -e PGPASSWORD="$DATABASE_PASSWORD" postgres:15 pg_dump -U "$DATABASE_USER" -h "$DATABASE_HOST" --schema=public --schema-only --port "$DATABASE_PORT" --dbname "$DATABASE_NAME" > init_1.sql

# Dump schema only
docker run --platform linux/amd64 --rm -ti -e PGPASSWORD="$DATABASE_PASSWORD" postgres:15 pg_dump -U "$DATABASE_USER" -h "$DATABASE_HOST" --schema=auth --schema-only --port "$DATABASE_PORT" --dbname "$DATABASE_NAME" > dump/auth.sql

# Dump schema only
docker run --platform linux/amd64 --rm -ti -e PGPASSWORD="$DATABASE_PASSWORD" postgres:15 pg_dump -U "$DATABASE_USER" -h "$DATABASE_HOST" --schema=history --schema-only --port "$DATABASE_PORT" --dbname "$DATABASE_NAME" > dump/history.sql

# Remove unnecessary lines from init_1.sql
sed -e '/CREATE EXTENSION/d' -e '/COMMENT ON EXTENSION/d' init_1.sql > init_2.sql

# Dump data only with INSERT statements
docker run --platform linux/amd64 --rm -ti -e PGPASSWORD="$DATABASE_PASSWORD" postgres:15 pg_dump -U "$DATABASE_USER" -h "$DATABASE_HOST" --table=public.* --data-only --column-inserts --port "$DATABASE_PORT" --dbname "$DATABASE_NAME" > dump/data.sql

# Dump globals only
docker run --platform linux/amd64 --rm -ti -e PGPASSWORD="$DATABASE_PASSWORD" postgres:15 pg_dumpall --globals-only -U "$DATABASE_USER" -h "$DATABASE_HOST" --port "$DATABASE_PORT" > init_00.sql

# Remove unnecessary lines from init_00.sql
sed -e '/CREATE ROLE postgres/d' -e '/ALTER ROLE postgres/d' init_00.sql > init_0.sql

# Concatenate files
mkdir -p dump
cat init_0.sql init_2.sql > dump/init.sql

# Clean up
rm init_0.sql init_00.sql init_1.sql init_2.sql

