-- Création de la table auteurs
CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Création de la table articles
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    auteur_id INTEGER REFERENCES auteurs(id)
);

-- Insertion de quelques auteurs
INSERT INTO auteurs (nom, email) VALUES
('Alice Dupont', 'alice.dupont@example.com'),
('Bob Martin', 'bob.martin@example.com');

-- Insertion de quelques articles
INSERT INTO articles (titre, contenu, auteur_id) VALUES
('Bienvenue sur notre blog !', 'Ceci est le premier article sur notre blog.', 1),
('Comment utiliser PostgreSQL', 'Un guide simple pour débuter avec PostgreSQL.', 2),
('Les meilleures pratiques SQL', 'Quelques astuces utiles pour écrire du SQL propre.', 1);
