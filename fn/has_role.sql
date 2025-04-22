CREATE OR REPLACE FUNCTION auth.has_role(role_names TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
AS $$
SELECT EXISTS (
    SELECT 1
    FROM auth.profil p
    JOIN auth.users u ON p.utilisateur_id = u.id
    JOIN auth.roles r ON p.role_id = r.id
    WHERE u.orion_id = auth.uid()
      AND r.name = ANY(role_names)
);
$$;