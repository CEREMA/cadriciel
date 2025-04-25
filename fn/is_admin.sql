CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    result BOOLEAN;

BEGIN
    
    SELECT EXISTS (
        SELECT 1
        FROM auth.profil p
        JOIN auth.users u ON p.utilisateur_id = u.id
        JOIN auth.roles r ON p.role_id = r.id
        WHERE u.orion_id = auth.uid()
          AND r.name = ANY(ARRAY['ADMIN'])
    )
    INTO resut;

    RETURN result;
END;
$$;