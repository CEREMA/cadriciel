-- Fonction de trigger : mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION fn.trigger_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;