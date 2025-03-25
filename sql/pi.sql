-- Création de la table avec une colonne géographique
CREATE TABLE points_interet (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100),
    description TEXT,
    categorie VARCHAR(50),
    geom GEOMETRY(Point, 4326)
);

-- Insertion de 20 enregistrements avec échappement correct des apostrophes
INSERT INTO points_interet (nom, description, categorie, geom)
VALUES
  ('Musée d''Art Moderne', 'Exposition d''art contemporain au cœur de la ville', 'Musée', ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)),
  ('Parc Central', 'Grand parc urbain avec espaces verts et aires de jeux', 'Parc', ST_SetSRID(ST_MakePoint(2.3515, 48.8570), 4326)),
  ('Bibliothèque Municipale', 'Bibliothèque proposant livres et animations culturelles', 'Bibliothèque', ST_SetSRID(ST_MakePoint(2.3528, 48.8575), 4326)),
  ('Café du Centre', 'Café convivial idéal pour des pauses détente', 'Restaurant', ST_SetSRID(ST_MakePoint(2.3530, 48.8560), 4326)),
  ('Théâtre de la Ville', 'Salle de spectacle proposant pièces de théâtre et concerts', 'Théâtre', ST_SetSRID(ST_MakePoint(2.3540, 48.8555), 4326)),
  ('Galerie d''Art', 'Galerie présentant des expositions d''artistes locaux', 'Galerie', ST_SetSRID(ST_MakePoint(2.3550, 48.8568), 4326)),
  ('Marché Local', 'Marché hebdomadaire avec produits frais et artisanat', 'Marché', ST_SetSRID(ST_MakePoint(2.3560, 48.8572), 4326)),
  ('Jardin Botanique', 'Espace naturel dédié aux plantes et à la biodiversité', 'Parc', ST_SetSRID(ST_MakePoint(2.3570, 48.8580), 4326)),
  ('Centre Culturel', 'Lieu d''accueil pour des événements et ateliers', 'Centre Culturel', ST_SetSRID(ST_MakePoint(2.3580, 48.8565), 4326)),
  ('Restaurant Le Gourmet', 'Restaurant gastronomique avec une vue panoramique', 'Restaurant', ST_SetSRID(ST_MakePoint(2.3590, 48.8578), 4326)),
  ('Musée Historique', 'Expositions sur l''histoire locale et régionale', 'Musée', ST_SetSRID(ST_MakePoint(2.3600, 48.8585), 4326)),
  ('Parc de la Liberté', 'Parc dédié aux espaces de détente et activités sportives', 'Parc', ST_SetSRID(ST_MakePoint(2.3610, 48.8590), 4326)),
  ('Salle de Concert', 'Salle acoustique accueillant divers artistes', 'Concert', ST_SetSRID(ST_MakePoint(2.3620, 48.8570), 4326)),
  ('Cinéma Paradiso', 'Cinéma proposant des films d''auteur et indépendants', 'Cinéma', ST_SetSRID(ST_MakePoint(2.3630, 48.8562), 4326)),
  ('Centre Sportif', 'Complexe sportif avec piscine et terrains de jeu', 'Sport', ST_SetSRID(ST_MakePoint(2.3640, 48.8558), 4326)),
  ('Place de la République', 'Place historique au centre-ville avec fontaine', 'Place Publique', ST_SetSRID(ST_MakePoint(2.3650, 48.8575), 4326)),
  ('Atelier d''Artisanat', 'Espace dédié aux artisans et démonstrations', 'Atelier', ST_SetSRID(ST_MakePoint(2.3660, 48.8582), 4326)),
  ('Espace Jeunesse', 'Centre d''activités pour enfants et adolescents', 'Loisirs', ST_SetSRID(ST_MakePoint(2.3670, 48.8567), 4326)),
  ('Station de Métro Central', 'Nœud de transport public au cœur de la ville', 'Transport', ST_SetSRID(ST_MakePoint(2.3680, 48.8579), 4326)),
  ('Marché de Nuit', 'Événement nocturne avec stands de nourriture et animations', 'Marché', ST_SetSRID(ST_MakePoint(2.3690, 48.8586), 4326));

-- Création d'un index spatial pour améliorer les performances des requêtes géographiques
CREATE INDEX idx_points_interet_geom ON points_interet USING GIST(geom);