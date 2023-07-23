--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: trigger_set_timestamp; Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updatedat = NOW();

  RETURN NEW;

END;

$$;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: department(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.department() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('request.department', true);
END;
$$;


ALTER FUNCTION auth.department() OWNER TO postgres;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('request.email', true);
END;
$$;


ALTER FUNCTION auth.email() OWNER TO postgres;

--
-- Name: name(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.name() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('request.name', true);
END;
$$;


ALTER FUNCTION auth.name() OWNER TO postgres;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('request.role', true);
END;
$$;


ALTER FUNCTION auth.role() OWNER TO postgres;

--
-- Name: username(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.username() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('request.username', true);
END;
$$;


ALTER FUNCTION auth.username() OWNER TO postgres;

--
-- Name: uuid(); Type: FUNCTION; Schema: auth; Owner: postgres
--

CREATE FUNCTION auth.uuid() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN current_setting('request.uuid', true);
END;
$$;


ALTER FUNCTION auth.uuid() OWNER TO postgres;

--
-- Name: history; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA history;


ALTER SCHEMA history OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: last_migration; Type: TABLE; Schema: history; Owner: postgres
--

CREATE TABLE history.last_migration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    migrations_id uuid,
    state_id uuid,
    lock boolean DEFAULT false,
    createdat timestamp with time zone DEFAULT now() NOT NULL,
    updatedat timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE history.last_migration OWNER TO postgres;

--
-- Name: log; Type: TABLE; Schema: history; Owner: postgres
--

CREATE TABLE history.log (
    id SERIAL PRIMARY KEY,
    "timestamp" timestamp with time zone DEFAULT now(),
    operation text,
    object_type text,
    schema_name text,
    object_identity text
);


ALTER TABLE history.log OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: history; Owner: postgres
--

CREATE TABLE history.migrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255),
    tables jsonb,
    columns jsonb,
    constraints jsonb,
    views jsonb,
    types jsonb,
    policies jsonb,
    functions jsonb,
    triggers jsonb,
    pg_types jsonb,
    createdat timestamp with time zone DEFAULT now() NOT NULL,
    updatedat timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE history.migrations OWNER TO postgres;

--
-- Name: last_migration last_migration_pkey; Type: CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.last_migration
    ADD CONSTRAINT last_migration_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: history; Owner: postgres
--

ALTER TABLE ONLY history.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: last_migration set_timestamp; Type: TRIGGER; Schema: history; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON history.last_migration FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: migrations set_timestamp; Type: TRIGGER; Schema: history; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON history.migrations FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: notify_ddl_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_ddl_changes() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj RECORD;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    INSERT INTO history.log (operation, object_type, schema_name, object_identity)
    VALUES (obj.command_tag, obj.object_type, obj.schema_name, obj.object_identity);

    PERFORM pg_notify('ddl_changes', obj.command_tag || ', ' || obj.object_type || ', ' || obj.schema_name || ', ' || obj.object_identity);
  END LOOP;
END;
$$;


ALTER FUNCTION public.notify_ddl_changes() OWNER TO postgres;


--
-- Name: notify_drop_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_drop_changes() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj RECORD;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    INSERT INTO history.log (operation, object_type, schema_name, object_identity)
    VALUES ('DROP', obj.object_type, obj.schema_name, obj.object_identity);

    PERFORM pg_notify('ddl_changes', 'DROP, ' || obj.object_type || ', ' || obj.schema_name || ', ' || obj.object_identity);
  END LOOP;
END;
$$;


ALTER FUNCTION public.notify_drop_changes() OWNER TO postgres;

--
-- Name: trigger_on_ddl; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER trigger_on_ddl ON ddl_command_end
   EXECUTE FUNCTION public.notify_ddl_changes();


ALTER EVENT TRIGGER trigger_on_ddl OWNER TO postgres;

--
-- Name: trigger_on_drop; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER trigger_on_drop ON sql_drop
   EXECUTE FUNCTION public.notify_drop_changes();


ALTER EVENT TRIGGER trigger_on_drop OWNER TO postgres;


