-- Création des séquences
CREATE SEQUENCE IF NOT EXISTS bd_id_seq;
CREATE SEQUENCE IF NOT EXISTS bd_auteur_id_seq;
CREATE SEQUENCE IF NOT EXISTS serie_id_seq;
CREATE SEQUENCE IF NOT EXISTS auteur_id_seq;
CREATE SEQUENCE IF NOT EXISTS editeur_id_seq;
CREATE SEQUENCE IF NOT EXISTS nationalite_id_seq;

-- Création des fonctions pour les triggers si elles n'existent pas déjà
CREATE OR REPLACE FUNCTION RI_FKey_cascade_del() RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM roles WHERE bd_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION RI_FKey_cascade_upd() RETURNS TRIGGER AS $$
BEGIN
    UPDATE roles SET bd_id = NEW.id WHERE bd_id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION RI_FKey_check_ins() RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION RI_FKey_check_upd() RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION RI_FKey_noaction_del() RETURNS TRIGGER AS $$
BEGIN
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION RI_FKey_noaction_upd() RETURNS TRIGGER AS $$
BEGIN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création des tables
CREATE TABLE nationalite (
    id bigint NOT NULL DEFAULT nextval('nationalite_id_seq'::regclass),
    code character varying NOT NULL,
    libelle character varying NOT NULL,
    CONSTRAINT nationalite_pkey PRIMARY KEY (id)
);

CREATE TABLE editeur (
    id bigint NOT NULL DEFAULT nextval('editeur_id_seq'::regclass),
    code character varying NOT NULL,
    libelle character varying NOT NULL,
    CONSTRAINT editeur_pkey PRIMARY KEY (id)
);

CREATE TABLE serie (
    id bigint NOT NULL DEFAULT nextval('serie_id_seq'::regclass),
    code character varying NOT NULL,
    libelle character varying NOT NULL,
    CONSTRAINT serie_pkey PRIMARY KEY (id)
);

CREATE TABLE auteur (
    id bigint NOT NULL DEFAULT nextval('auteur_id_seq'::regclass),
    nom character varying,
    prenom character varying,
    pseudonyme character varying,
    nationalite_id integer,
    datenaissance date,
    datedeces date,
    scenariste boolean DEFAULT false,
    dessinateur boolean DEFAULT false,
    coloriste boolean DEFAULT false,
    CONSTRAINT auteur_pkey PRIMARY KEY (id),
    CONSTRAINT auteur_nationalite_fk FOREIGN KEY (nationalite_id) REFERENCES nationalite(id)
);

CREATE TABLE bd (
    id bigint NOT NULL DEFAULT nextval('bd_id_seq'::regclass),
    titre character varying NOT NULL,
    serie_id integer,
    editeur_id integer,
    dateparution date,
    album integer NOT NULL,
    CONSTRAINT bd_pkey PRIMARY KEY (id),
    CONSTRAINT bd_serie_fk FOREIGN KEY (serie_id) REFERENCES serie(id),
    CONSTRAINT bd_editeur_fk FOREIGN KEY (editeur_id) REFERENCES editeur(id)
);

CREATE TABLE roles (
    id bigint NOT NULL DEFAULT nextval('bd_auteur_id_seq'::regclass),
    auteur_id integer,
    bd_id integer,
    scenariste boolean DEFAULT false,
    dessinateur boolean,
    coloriste boolean DEFAULT false,
    CONSTRAINT bd_auteur_pkey PRIMARY KEY (id),
    CONSTRAINT roles_auteur_fk FOREIGN KEY (auteur_id) REFERENCES auteur(id),
    CONSTRAINT roles_bd_fk FOREIGN KEY (bd_id) REFERENCES bd(id)
);

-- Création des triggers
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32145" 
AFTER DELETE ON bd 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_cascade_del();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32146" 
AFTER UPDATE ON bd 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_cascade_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32152" 
AFTER INSERT ON bd 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_ins();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32153" 
AFTER UPDATE ON bd 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32157" 
AFTER INSERT ON bd 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_ins();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32158" 
AFTER UPDATE ON bd 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32142" 
AFTER INSERT ON roles 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_ins();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32143" 
AFTER UPDATE ON roles 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32147" 
AFTER INSERT ON roles 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_ins();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32148" 
AFTER UPDATE ON roles 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32155" 
AFTER DELETE ON serie 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_del();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32156" 
AFTER UPDATE ON serie 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32140" 
AFTER DELETE ON auteur 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_del();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32141" 
AFTER UPDATE ON auteur 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32137" 
AFTER INSERT ON auteur 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_ins();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32138" 
AFTER UPDATE ON auteur 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_check_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32150" 
AFTER DELETE ON editeur 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_del();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32151" 
AFTER UPDATE ON editeur 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_upd();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32135" 
AFTER DELETE ON nationalite 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_del();

CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32136" 
AFTER UPDATE ON nationalite 
FOR EACH ROW EXECUTE FUNCTION RI_FKey_noaction_upd();

-- Activation des triggers
ALTER TABLE bd ENABLE TRIGGER ALL;
ALTER TABLE roles ENABLE TRIGGER ALL;
ALTER TABLE serie ENABLE TRIGGER ALL;
ALTER TABLE auteur ENABLE TRIGGER ALL;
ALTER TABLE editeur ENABLE TRIGGER ALL;
ALTER TABLE nationalite ENABLE TRIGGER ALL;



-- Jeu de tests avec une centaine d'enregistrements

-- 1. Insertion dans nationalite (10 enregistrements)
INSERT INTO nationalite (code, libelle) VALUES
    ('FR', 'France'),
    ('BE', 'Belgique'),
    ('US', 'États-Unis'),
    ('JP', 'Japon'),
    ('IT', 'Italie'),
    ('ES', 'Espagne'),
    ('UK', 'Royaume-Uni'),
    ('CA', 'Canada'),
    ('DE', 'Allemagne'),
    ('CH', 'Suisse');

-- 2. Insertion dans editeur (10 enregistrements)
INSERT INTO editeur (code, libelle) VALUES
    ('DAR', 'Dargaud'),
    ('DUP', 'Dupuis'),
    ('CAS', 'Casterman'),
    ('GLN', 'Glénat'),
    ('DEL', 'Delcourt'),
    ('SOL', 'Soleil'),
    ('LOM', 'Lombard'),
    ('FUT', 'Futuropolis'),
    ('HUM', 'Humanoïdes Associés'),
    ('BAM', 'Bamboo');

-- 3. Insertion dans serie (15 enregistrements)
INSERT INTO serie (code, libelle) VALUES
    ('TIN', 'Les Aventures de Tintin'),
    ('AST', 'Astérix'),
    ('BLA', 'Blake et Mortimer'),
    ('SPI', 'Spirou et Fantasio'),
    ('LUC', 'Lucky Luke'),
    ('GAS', 'Gaston'),
    ('NAR', 'Naruto'),
    ('ONE', 'One Piece'),
    ('DRG', 'Dragon Ball'),
    ('XIII', 'XIII'),
    ('LAN', 'Lanfeust'),
    ('THO', 'Thorgal'),
    ('VAL', 'Valérian'),
    ('MUR', 'Murena'),
    ('CAL', 'Calvin et Hobbes');

-- 4. Insertion dans auteur (30 enregistrements)
INSERT INTO auteur (nom, prenom, pseudonyme, nationalite_id, datenaissance, datedeces, scenariste, dessinateur, coloriste) VALUES
    ('Hergé', NULL, 'Hergé', (SELECT id FROM nationalite WHERE code = 'BE'), '1907-05-22', '1983-03-03', true, true, false),
    ('Goscinny', 'René', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1926-08-14', '1977-11-05', true, false, false),
    ('Uderzo', 'Albert', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1927-04-25', '2020-03-24', false, true, false),
    ('Jacobs', 'Edgar P.', NULL, (SELECT id FROM nationalite WHERE code = 'BE'), '1904-03-30', '1987-02-20', true, true, false),
    ('Franquin', 'André', NULL, (SELECT id FROM nationalite WHERE code = 'BE'), '1924-01-03', '1997-01-05', true, true, false),
    ('Morris', NULL, 'Morris', (SELECT id FROM nationalite WHERE code = 'BE'), '1923-12-01', '2001-07-16', true, true, false),
    ('Kishimoto', 'Masashi', NULL, (SELECT id FROM nationalite WHERE code = 'JP'), '1974-11-08', NULL, true, true, false),
    ('Oda', 'Eiichiro', NULL, (SELECT id FROM nationalite WHERE code = 'JP'), '1975-01-01', NULL, true, true, false),
    ('Toriyama', 'Akira', NULL, (SELECT id FROM nationalite WHERE code = 'JP'), '1955-04-05', '2024-03-01', true, true, false),
    ('Van Hamme', 'Jean', NULL, (SELECT id FROM nationalite WHERE code = 'BE'), '1939-01-16', NULL, true, false, false),
    ('Vance', 'William', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1935-09-08', '2018-05-14', false, true, false),
    ('Arleston', 'Christophe', 'Scotch Arleston', (SELECT id FROM nationalite WHERE code = 'FR'), '1963-08-14', NULL, true, false, false),
    ('Tarquin', 'Didier', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1969-01-20', NULL, false, true, false),
    ('Rosinski', 'Grzegorz', NULL, (SELECT id FROM nationalite WHERE code = 'DE'), '1941-08-03', NULL, false, true, false),
    ('Mezieres', 'Jean-Claude', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1938-09-23', '2021-12-23', false, true, false),
    ('Christin', 'Pierre', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1938-07-27', NULL, true, false, false),
    ('Dufaux', 'Jean', NULL, (SELECT id FROM nationalite WHERE code = 'BE'), '1949-06-07', NULL, true, false, false),
    ('Delaby', 'Philippe', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1961-01-01', '2014-01-29', false, true, false),
    ('Watterson', 'Bill', NULL, (SELECT id FROM nationalite WHERE code = 'US'), '1958-07-05', NULL, true, true, false),
    ('Charlier', 'Jean-Michel', NULL, (SELECT id FROM nationalite WHERE code = 'BE'), '1924-09-30', '1989-07-10', true, false, false),
    ('Giraud', 'Jean', 'Moebius', (SELECT id FROM nationalite WHERE code = 'FR'), '1938-05-08', '2012-03-10', false, true, false),
    ('Tardi', 'Jacques', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1946-08-30', NULL, true, true, false),
    ('Le Gall', 'Frank', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1959-09-23', NULL, true, true, false),
    ('Hermann', NULL, 'Hermann', (SELECT id FROM nationalite WHERE code = 'BE'), '1938-07-17', NULL, true, true, false),
    ('Larcenet', 'Manu', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1969-05-06', NULL, true, true, false),
    ('Bilal', 'Enki', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1951-10-07', NULL, true, true, false),
    ('Munuera', 'José Luis', NULL, (SELECT id FROM nationalite WHERE code = 'ES'), '1972-04-21', NULL, false, true, false),
    ('Morvan', 'Jean-David', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1969-11-28', NULL, true, false, false),
    ('Trondheim', 'Lewis', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1964-12-11', NULL, true, true, false),
    ('Sfar', 'Joann', NULL, (SELECT id FROM nationalite WHERE code = 'FR'), '1971-08-28', NULL, true, true, false);

-- 5. Insertion dans bd (35 enregistrements)
INSERT INTO bd (titre, serie_id, editeur_id, dateparution, album) VALUES
    ('Tintin au Congo', (SELECT id FROM serie WHERE code = 'TIN'), (SELECT id FROM editeur WHERE code = 'CAS'), '1931-06-05', 2),
    ('Astérix le Gaulois', (SELECT id FROM serie WHERE code = 'AST'), (SELECT id FROM editeur WHERE code = 'DAR'), '1961-10-29', 1),
    ('La Marque Jaune', (SELECT id FROM serie WHERE code = 'BLA'), (SELECT id FROM editeur WHERE code = 'LOM'), '1956-08-06', 6),
    ('Spirou et les Héritiers', (SELECT id FROM serie WHERE code = 'SPI'), (SELECT id FROM editeur WHERE code = 'DUP'), '1952-03-20', 4),
    ('Lucky Luke contre Joss Jamon', (SELECT id FROM serie WHERE code = 'LUC'), (SELECT id FROM editeur WHERE code = 'DUP'), '1958-03-15', 11),
    ('Gaston Lagaffe T1', (SELECT id FROM serie WHERE code = 'GAS'), (SELECT id FROM editeur WHERE code = 'DUP'), '1960-02-01', 1),
    ('Naruto Vol.1', (SELECT id FROM serie WHERE code = 'NAR'), (SELECT id FROM editeur WHERE code = 'GLN'), '2000-03-03', 1),
    ('One Piece Vol.1', (SELECT id FROM serie WHERE code = 'ONE'), (SELECT id FROM editeur WHERE code = 'GLN'), '1997-07-22', 1),
    ('Dragon Ball Vol.1', (SELECT id FROM serie WHERE code = 'DRG'), (SELECT id FROM editeur WHERE code = 'GLN'), '1984-11-20', 1),
    ('XIII - Le Jour du Soleil Noir', (SELECT id FROM serie WHERE code = 'XIII'), (SELECT id FROM editeur WHERE code = 'DAR'), '1984-10-01', 1),
    ('Lanfeust de Troy T1', (SELECT id FROM serie WHERE code = 'LAN'), (SELECT id FROM editeur WHERE code = 'SOL'), '1994-06-15', 1),
    ('Thorgal - La Magicienne Trahie', (SELECT id FROM serie WHERE code = 'THO'), (SELECT id FROM editeur WHERE code = 'LOM'), '1980-02-01', 1),
    ('Valérian - La Cité des Eaux Mouvantes', (SELECT id FROM serie WHERE code = 'VAL'), (SELECT id FROM editeur WHERE code = 'DAR'), '1970-07-01', 2),
    ('Murena - Le Cycle de la Mère', (SELECT id FROM serie WHERE code = 'MUR'), (SELECT id FROM editeur WHERE code = 'DAR'), '1997-11-20', 1),
    ('Calvin et Hobbes T1', (SELECT id FROM serie WHERE code = 'CAL'), (SELECT id FROM editeur WHERE code = 'HUM'), '1987-03-01', 1),
    ('Tintin au Tibet', (SELECT id FROM serie WHERE code = 'TIN'), (SELECT id FROM editeur WHERE code = 'CAS'), '1960-09-25', 20),
    ('Astérix et Cléopâtre', (SELECT id FROM serie WHERE code = 'AST'), (SELECT id FROM editeur WHERE code = 'DAR'), '1965-03-31', 6),
    ('Le Secret de l''Espadon', (SELECT id FROM serie WHERE code = 'BLA'), (SELECT id FROM editeur WHERE code = 'LOM'), '1948-09-01', 1),
    ('Spirou à New York', (SELECT id FROM serie WHERE code = 'SPI'), (SELECT id FROM editeur WHERE code = 'DUP'), '1987-04-10', 39),
    ('Le Bandit Manchot', (SELECT id FROM serie WHERE code = 'LUC'), (SELECT id FROM editeur WHERE code = 'DAR'), '1981-10-15', 50),
    ('Naruto Vol.10', (SELECT id FROM serie WHERE code = 'NAR'), (SELECT id FROM editeur WHERE code = 'GLN'), '2002-05-10', 10),
    ('One Piece Vol.20', (SELECT id FROM serie WHERE code = 'ONE'), (SELECT id FROM editeur WHERE code = 'GLN'), '2001-12-04', 20),
    ('Dragon Ball Z Vol.1', (SELECT id FROM serie WHERE code = 'DRG'), (SELECT id FROM editeur WHERE code = 'GLN'), '1989-03-10', 18),
    ('XIII - Toutes les Larmes de l''Enfer', (SELECT id FROM serie WHERE code = 'XIII'), (SELECT id FROM editeur WHERE code = 'DAR'), '1986-11-01', 3),
    ('Lanfeust des Étoiles T1', (SELECT id FROM serie WHERE code = 'LAN'), (SELECT id FROM editeur WHERE code = 'SOL'), '2001-11-20', 1),
    ('Thorgal - Les Archers', (SELECT id FROM serie WHERE code = 'THO'), (SELECT id FROM editeur WHERE code = 'LOM'), '1985-10-01', 9),
    ('Valérian - L''Ambassadeur des Ombres', (SELECT id FROM serie WHERE code = 'VAL'), (SELECT id FROM editeur WHERE code = 'DAR'), '1975-06-01', 6),
    ('Murena - Les Épines', (SELECT id FROM serie WHERE code = 'MUR'), (SELECT id FROM editeur WHERE code = 'DAR'), '2001-03-15', 4),
    ('Calvin et Hobbes T10', (SELECT id FROM serie WHERE code = 'CAL'), (SELECT id FROM editeur WHERE code = 'HUM'), '1995-11-01', 10),
    ('Tintin et les Picaros', (SELECT id FROM serie WHERE code = 'TIN'), (SELECT id FROM editeur WHERE code = 'CAS'), '1976-04-15', 23),
    ('Astérix chez les Bretons', (SELECT id FROM serie WHERE code = 'AST'), (SELECT id FROM editeur WHERE code = 'DAR'), '1966-10-20', 8),
    ('Le Mystère de la Grande Pyramide', (SELECT id FROM serie WHERE code = 'BLA'), (SELECT id FROM editeur WHERE code = 'LOM'), '1950-03-01', 4),
    ('Spirou et la Gorgone Bleue', (SELECT id FROM serie WHERE code = 'SPI'), (SELECT id FROM editeur WHERE code = 'DUP'), '2000-09-15', 46),
    ('Lucky Luke - Le Juge', (SELECT id FROM serie WHERE code = 'LUC'), (SELECT id FROM editeur WHERE code = 'DAR'), '1959-03-01', 13),
    ('Gaston Lagaffe T5', (SELECT id FROM serie WHERE code = 'GAS'), (SELECT id FROM editeur WHERE code = 'DUP'), '1967-05-01', 5);

-- 6. Insertion dans roles (50 enregistrements)
INSERT INTO roles (auteur_id, bd_id, scenariste, dessinateur, coloriste) VALUES
    ((SELECT id FROM auteur WHERE pseudonyme = 'Hergé'), (SELECT id FROM bd WHERE titre = 'Tintin au Congo'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Goscinny'), (SELECT id FROM bd WHERE titre = 'Astérix le Gaulois'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Uderzo'), (SELECT id FROM bd WHERE titre = 'Astérix le Gaulois'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Jacobs'), (SELECT id FROM bd WHERE titre = 'La Marque Jaune'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Franquin'), (SELECT id FROM bd WHERE titre = 'Spirou et les Héritiers'), true, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Morris'), (SELECT id FROM bd WHERE titre = 'Lucky Luke contre Joss Jamon'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Franquin'), (SELECT id FROM bd WHERE titre = 'Gaston Lagaffe T1'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Kishimoto'), (SELECT id FROM bd WHERE titre = 'Naruto Vol.1'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Oda'), (SELECT id FROM bd WHERE titre = 'One Piece Vol.1'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Toriyama'), (SELECT id FROM bd WHERE titre = 'Dragon Ball Vol.1'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Van Hamme'), (SELECT id FROM bd WHERE titre = 'XIII - Le Jour du Soleil Noir'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Vance'), (SELECT id FROM bd WHERE titre = 'XIII - Le Jour du Soleil Noir'), false, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Scotch Arleston'), (SELECT id FROM bd WHERE titre = 'Lanfeust de Troy T1'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Tarquin'), (SELECT id FROM bd WHERE titre = 'Lanfeust de Troy T1'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Van Hamme'), (SELECT id FROM bd WHERE titre = 'Thorgal - La Magicienne Trahie'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Rosinski'), (SELECT id FROM bd WHERE titre = 'Thorgal - La Magicienne Trahie'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Christin'), (SELECT id FROM bd WHERE titre = 'Valérian - La Cité des Eaux Mouvantes'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Mezieres'), (SELECT id FROM bd WHERE titre = 'Valérian - La Cité des Eaux Mouvantes'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Dufaux'), (SELECT id FROM bd WHERE titre = 'Murena - Le Cycle de la Mère'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Delaby'), (SELECT id FROM bd WHERE titre = 'Murena - Le Cycle de la Mère'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Watterson'), (SELECT id FROM bd WHERE titre = 'Calvin et Hobbes T1'), true, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Hergé'), (SELECT id FROM bd WHERE titre = 'Tintin au Tibet'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Goscinny'), (SELECT id FROM bd WHERE titre = 'Astérix et Cléopâtre'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Uderzo'), (SELECT id FROM bd WHERE titre = 'Astérix et Cléopâtre'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Jacobs'), (SELECT id FROM bd WHERE titre = 'Le Secret de l''Espadon'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Franquin'), (SELECT id FROM bd WHERE titre = 'Spirou à New York'), true, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Morris'), (SELECT id FROM bd WHERE titre = 'Le Bandit Manchot'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Kishimoto'), (SELECT id FROM bd WHERE titre = 'Naruto Vol.10'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Oda'), (SELECT id FROM bd WHERE titre = 'One Piece Vol.20'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Toriyama'), (SELECT id FROM bd WHERE titre = 'Dragon Ball Z Vol.1'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Van Hamme'), (SELECT id FROM bd WHERE titre = 'XIII - Toutes les Larmes de l''Enfer'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Vance'), (SELECT id FROM bd WHERE titre = 'XIII - Toutes les Larmes de l''Enfer'), false, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Scotch Arleston'), (SELECT id FROM bd WHERE titre = 'Lanfeust des Étoiles T1'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Tarquin'), (SELECT id FROM bd WHERE titre = 'Lanfeust des Étoiles T1'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Van Hamme'), (SELECT id FROM bd WHERE titre = 'Thorgal - Les Archers'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Rosinski'), (SELECT id FROM bd WHERE titre = 'Thorgal - Les Archers'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Christin'), (SELECT id FROM bd WHERE titre = 'Valérian - L''Ambassadeur des Ombres'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Mezieres'), (SELECT id FROM bd WHERE titre = 'Valérian - L''Ambassadeur des Ombres'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Dufaux'), (SELECT id FROM bd WHERE titre = 'Murena - Les Épines'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Delaby'), (SELECT id FROM bd WHERE titre = 'Murena - Les Épines'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Watterson'), (SELECT id FROM bd WHERE titre = 'Calvin et Hobbes T10'), true, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Hergé'), (SELECT id FROM bd WHERE titre = 'Tintin et les Picaros'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Goscinny'), (SELECT id FROM bd WHERE titre = 'Astérix chez les Bretons'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Uderzo'), (SELECT id FROM bd WHERE titre = 'Astérix chez les Bretons'), false, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Jacobs'), (SELECT id FROM bd WHERE titre = 'Le Mystère de la Grande Pyramide'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Morvan'), (SELECT id FROM bd WHERE titre = 'Spirou et la Gorgone Bleue'), true, false, false),
    ((SELECT id FROM auteur WHERE nom = 'Munuera'), (SELECT id FROM bd WHERE titre = 'Spirou et la Gorgone Bleue'), false, true, false),
    ((SELECT id FROM auteur WHERE pseudonyme = 'Morris'), (SELECT id FROM bd WHERE titre = 'Lucky Luke - Le Juge'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Franquin'), (SELECT id FROM bd WHERE titre = 'Gaston Lagaffe T5'), true, true, false),
    ((SELECT id FROM auteur WHERE nom = 'Charlier'), (SELECT id FROM bd WHERE titre = 'Lucky Luke - Le Juge'), true, false, false);