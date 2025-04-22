CREATE OR REPLACE FUNCTION [schema].[fonction]()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    result BOOLEAN;

BEGIN
    
    SELECT EXISTS (
    
        -- ta fonction SQL
        -- exemple:
        -- SELECT 1 FROM [schema].[table] WHERE ...
    
    )
    INTO resut;

    RETURN result;
END;
$$;