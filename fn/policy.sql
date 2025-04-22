  DECLARE
    result boolean;

  BEGIN
    
    SELECT EXISTS(

        -- Votre requête SQL
        -- SELECT 1 FROM ...

    ) INTO result;

    RETURN result;

  END;