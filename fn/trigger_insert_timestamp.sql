-- Fonction de trigger : mettre à jour automatiquement created_at
CREATE OR REPLACE FUNCTION fn.trigger_insert_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$;