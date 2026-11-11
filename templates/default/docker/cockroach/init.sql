-- Runs once, when the CockroachDB volume is empty. To run it again, delete the
-- data with `docker compose down -v`, then `pnpm db:start`.
--
-- Creates the app user and its databases (`DATABASE_URL`, `TEST_DATABASE_URL`)
-- and gives it full rights on their `public` schema, including tables and
-- sequences created there later, so Prisma can create tables right away.
-- CREATEDB lets `prisma migrate dev` make its shadow database.
--
-- CockroachDB creates tables schema-locked by default, which blocks the
-- ALTER TABLE statements Prisma runs after CREATE TABLE (foreign keys,
-- indexes), so the app user creates them unlocked.

CREATE USER IF NOT EXISTS starter_app WITH CREATEDB;
ALTER ROLE starter_app SET create_table_with_schema_locked = false;

CREATE DATABASE IF NOT EXISTS starter_app;
ALTER DATABASE starter_app OWNER TO starter_app;
USE starter_app;
GRANT ALL ON SCHEMA public TO starter_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO starter_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO starter_app;

CREATE DATABASE IF NOT EXISTS starter_app_test;
ALTER DATABASE starter_app_test OWNER TO starter_app;
USE starter_app_test;
GRANT ALL ON SCHEMA public TO starter_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO starter_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO starter_app;
