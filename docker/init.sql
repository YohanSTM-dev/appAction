-- ============================================================
--  Init Docker — AppAction
--  Schéma complet + jeux de données de test
-- ============================================================

CREATE DATABASE IF NOT EXISTS appAction CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE appAction;

-- ── Tables de référence ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomRole VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS TypeContrat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heureContrat VARCHAR(50),
    nomTypeContrat VARCHAR(50),
    creneau ENUM('matin','soir') NULL
);

CREATE TABLE IF NOT EXISTS Magasin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ville VARCHAR(255),
    rue VARCHAR(255),
    adresse VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS TypeCaisse (
    id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS MotifCasse (
    id INT AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Emplacement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomZone VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS CouleurTache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    couleur VARCHAR(50),
    nomCouleurRep VARCHAR(50)
);

-- ── Tables principales ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS Employe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomEmploye VARCHAR(50),
    prenomEmploye VARCHAR(50),
    matriculeEmploye VARCHAR(50) NOT NULL UNIQUE,
    mdpEmploye VARCHAR(255),
    date_embauche DATE,
    emailEmploye VARCHAR(100),
    magasin_id INT,
    type_contrat_id INT,
    FOREIGN KEY (magasin_id) REFERENCES Magasin(id),
    FOREIGN KEY (type_contrat_id) REFERENCES TypeContrat(id)
);

CREATE TABLE IF NOT EXISTS TacheMag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomTache VARCHAR(255),
    couleur_tache_id INT NOT NULL,
    FOREIGN KEY (couleur_tache_id) REFERENCES CouleurTache(id)
);

CREATE TABLE IF NOT EXISTS Planning (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dateDebut DATE,
    dateFin DATE,
    statut VARCHAR(50),
    creneau ENUM('matin','soir') NULL,
    employe_id INT NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

CREATE TABLE IF NOT EXISTS Messagerie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    texteMessagerie TEXT,
    dateEnvoi DATE,
    est_lu BOOLEAN,
    employe_id INT NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

CREATE TABLE IF NOT EXISTS DeclarationCasse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dateDeclaration DATE,
    employe_id INT NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

CREATE TABLE IF NOT EXISTS Produit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code25 VARCHAR(50),
    codeBarre VARCHAR(50),
    libelleProduit VARCHAR(50),
    prixVente INT,
    seuilAlerteStock VARCHAR(50),
    colisage INT,
    declaration_casse_id INT,
    FOREIGN KEY (declaration_casse_id) REFERENCES DeclarationCasse(id)
);

CREATE TABLE IF NOT EXISTS DemandeReapro (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dateDemande DATE,
    statut VARCHAR(50),
    priorite VARCHAR(50),
    produit_id INT NOT NULL,
    employe_id INT NOT NULL,
    FOREIGN KEY (produit_id) REFERENCES Produit(id),
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

CREATE TABLE IF NOT EXISTS Caisse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_caisse_id INT NOT NULL,
    magasin_id INT NOT NULL,
    FOREIGN KEY (type_caisse_id) REFERENCES TypeCaisse(id),
    FOREIGN KEY (magasin_id) REFERENCES Magasin(id)
);

CREATE TABLE IF NOT EXISTS Vehicule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marque VARCHAR(50),
    immatriculation VARCHAR(50),
    puissanceFisc INT,
    employe_id INT NOT NULL UNIQUE,
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

CREATE TABLE IF NOT EXISTS FicheDePaie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mois VARCHAR(20),
    annee INT,
    salaireBrut DECIMAL(10,2),
    salaireNet DECIMAL(10,2),
    employe_id INT NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

CREATE TABLE IF NOT EXISTS Conge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dateDebut DATE,
    dateFin DATE,
    statut VARCHAR(50),
    motif VARCHAR(255),
    employe_id INT NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES Employe(id)
);

-- ── Tables d'association ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employe_role (
    employe_id INT,
    role_id INT,
    PRIMARY KEY (employe_id, role_id),
    FOREIGN KEY (employe_id) REFERENCES Employe(id),
    FOREIGN KEY (role_id) REFERENCES Role(id)
);

CREATE TABLE IF NOT EXISTS tache_planning (
    tache_id INT,
    planning_id INT,
    PRIMARY KEY (tache_id, planning_id),
    FOREIGN KEY (tache_id) REFERENCES TacheMag(id),
    FOREIGN KEY (planning_id) REFERENCES Planning(id)
);

CREATE TABLE IF NOT EXISTS declaration_motif (
    declaration_casse_id INT,
    motif_casse_id INT,
    PRIMARY KEY (declaration_casse_id, motif_casse_id),
    FOREIGN KEY (declaration_casse_id) REFERENCES DeclarationCasse(id),
    FOREIGN KEY (motif_casse_id) REFERENCES MotifCasse(id)
);

CREATE TABLE IF NOT EXISTS magasin_produit (
    magasin_id INT,
    produit_id INT,
    PRIMARY KEY (magasin_id, produit_id),
    FOREIGN KEY (magasin_id) REFERENCES Magasin(id),
    FOREIGN KEY (produit_id) REFERENCES Produit(id)
);

CREATE TABLE IF NOT EXISTS stock (
    produit_id INT,
    emplacement_id INT,
    quantite INT,
    PRIMARY KEY (produit_id, emplacement_id),
    FOREIGN KEY (produit_id) REFERENCES Produit(id),
    FOREIGN KEY (emplacement_id) REFERENCES Emplacement(id)
);

-- ============================================================
--  JEUX DE DONNÉES DE TEST
-- ============================================================

-- Rôles
INSERT INTO Role (id, nomRole) VALUES
    (1, 'employe'),
    (2, 'manager'),
    (3, 'rh'),
    (4, 'admin');

-- Types de contrat
INSERT INTO TypeContrat (id, nomTypeContrat, heureContrat, creneau) VALUES
    (1, 'CDI Flexible',      '35h', NULL),
    (2, 'CDI Matin',         '35h', 'matin'),
    (3, 'CDI Soir',          '35h', 'soir'),
    (4, 'CDD Flexible',      '28h', NULL);

-- Magasin de test
INSERT INTO Magasin (id, ville, rue, adresse) VALUES
    (1, 'Paris',    '12 rue de la Paix',       'Paris 75001'),
    (2, 'Lyon',     '3 avenue Berthelot',       'Lyon 69007'),
    (3, 'Bordeaux', '45 cours de la Marne',     'Bordeaux 33000');

-- Couleurs de tâches
INSERT INTO CouleurTache (id, couleur, nomCouleurRep) VALUES
    (1, '#E3001B', 'Urgent'),
    (2, '#3b82f6', 'Standard'),
    (3, '#22c55e', 'Formation'),
    (4, '#f59e0b', 'Réception');

-- Tâches
INSERT INTO TacheMag (id, nomTache, couleur_tache_id) VALUES
    (1, 'Mise en rayon',      2),
    (2, 'Caisse',             2),
    (3, 'Réception livraison', 4),
    (4, 'Inventaire',         1),
    (5, 'Formation sécurité', 3);

-- Employés (mots de passe bcrypt — voir tableau ci-dessous)
-- EMP-001 : Employe2024!
-- EMP-002 : Manager2024!
-- EMP-003 : RH2024!
-- EMP-004 : Admin2024!
INSERT INTO Employe (id, nomEmploye, prenomEmploye, matriculeEmploye, mdpEmploye, date_embauche, emailEmploye, magasin_id, type_contrat_id) VALUES
    (1, 'Dupont',  'Jean',    'EMP-001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhkWq1aIlqZEZQOWYkKnbW', '2023-03-15', 'jean.dupont@action.fr',    1, 1),
    (2, 'Martin',  'Sophie',  'EMP-002', '$2b$12$X8vQ9p2KmN7rL4sT6uY3aO1bC5dE8fG0hI9jK2lM3nP4qR5sT6uV7', '2021-09-01', 'sophie.martin@action.fr',  1, 1),
    (3, 'Bernard', 'Claire',  'EMP-003', '$2b$12$A1bC2dE3fG4hI5jK6lM7nO8pQ9rS0tU1vW2xY3zA4bC5dE6fG7hI8', '2020-06-20', 'claire.bernard@action.fr', 1, 1),
    (4, 'Leroy',   'Thomas',  'EMP-004', '$2b$12$B2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9', '2019-01-10', 'thomas.leroy@action.fr',   1, 1),
    (5, 'Petit',   'Marie',   'EMP-005', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhkWq1aIlqZEZQOWYkKnbW', '2024-01-08', 'marie.petit@action.fr',    1, 2),
    (6, 'Moreau',  'Lucas',   'EMP-006', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhkWq1aIlqZEZQOWYkKnbW', '2024-02-12', 'lucas.moreau@action.fr',   1, 3);

-- Association employés ↔ rôles
INSERT INTO employe_role (employe_id, role_id) VALUES
    (1, 1),  -- Jean     → employé
    (2, 2),  -- Sophie   → manager
    (3, 3),  -- Claire   → RH
    (4, 4),  -- Thomas   → admin
    (5, 1),  -- Marie    → employé
    (6, 1);  -- Lucas    → employé

-- Note : les mots de passe bcrypt ci-dessus sont des placeholders.
-- Le script seed-users.js les générera correctement au démarrage.
-- Voir docker-compose.yml : le service backend lance seed:users après démarrage.
