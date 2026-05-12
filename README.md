# appAction

Application de gestion de magasin(s) — plannings, employés, congés, paie, tâches.

Projet organisé en 2 parties :

- `front/` — Interface React + Vite
- `backend/` — API REST Node.js + Express + Sequelize (MySQL)

---

## Sommaire

1. [Architecture](#architecture)
2. [Installation & démarrage](#installation--démarrage)
3. [Configuration base de données](#configuration-base-de-données)
4. [Routes API](#routes-api)
5. [Détail des modules](#détail-des-modules)
   - [Employés](#employés)
   - [Magasins](#magasins)
   - [Types de contrat](#types-de-contrat)
   - [Congés](#congés)
   - [Paie](#paie)
   - [Planning](#planning)
   - [Tâches](#tâches)
6. [Arborescence complète](#arborescence-complète)

---

## Architecture

```
appAction--
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.config.js          ← Paramètres de connexion MySQL
│   │   ├── controller/               ← Logique métier (un fichier par module)
│   │   │   ├── employe.controller.js
│   │   │   ├── magasin.controller.js
│   │   │   ├── typeContrat.controller.js
│   │   │   ├── conge.controller.js
│   │   │   ├── paie.controller.js
│   │   │   ├── planning.controller.js
│   │   │   └── tacheMag.controller.js
│   │   ├── db/
│   │   │   └── connexionBdd.js        ← Instance Sequelize + chargement des modèles
│   │   ├── models/                    ← Modèles Sequelize (auto-générés)
│   │   │   └── init-models.js         ← Enregistre toutes les tables et relations
│   │   ├── routes/                    ← Définition des routes HTTP
│   │   │   ├── employe.routes.js
│   │   │   ├── magasin.routes.js
│   │   │   ├── typeContrat.routes.js
│   │   │   ├── conge.routes.js
│   │   │   ├── paie.routes.js
│   │   │   ├── planning.routes.js
│   │   │   └── tacheMag.routes.js
│   │   └── server.js                  ← Point d'entrée Express
│   └── package.json
├── front/
│   ├── pages/                         ← Pages React (Login, Planning, RH, etc.)
│   ├── src/
│   │   └── App.jsx                    ← Routage React
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Installation & démarrage !!!

Il y a deux façons de lancer le projet.

---

### Méthode 1 — Docker (plus facile)

#### Installer Docker (si pas déjà installé)

**Windows / Mac :**
Télécharger et installer [Docker Desktop](https://www.docker.com/products/docker-desktop/), puis le lancer.

**Linux (Debian / Ubuntu) :**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

**Vérification que Docker est bien installé :**
```bash
docker --version
docker-compose --version
```

---

```bash
# 1. Cloner le dépôt
git clone https://github.com/YohanSTM-dev/appAction.git
cd appAction

# 2. Basculer sur la branche d'installation
git checkout installation-projet

# 3. Lancer tous les services (MySQL + backend + frontend)
docker-compose up --build
```

Une fois les containers démarrés :

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000/login |
| API backend | http://localhost:5000/api |


**Comptes de test disponibles :**

> La connexion se fait avec l'**email** et le mot de passe.

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Employé | `jean.dupont@action.fr` | `Employe2024!` |
| Manager | `sophie.martin@action.fr` | `Manager2024!` |
| RH | `claire.bernard@action.fr` | `RH2024!` |
| Admin | `thomas.leroy@action.fr` | `Admin2024!` |

Pour tout arrêter :
```bash
docker-compose down
```

Pour tout arrêter et supprimer les données :
```bash
docker-compose down -v
```

---

### Méthode 2 — Installation manuelle (avec votre propre MySQL)

**Prérequis :**
- Node.js ≥ 18
- MySQL accessible (adapter `backend/src/config/db.config.js`)

**1. Base de données**

Importer le schéma dans votre MySQL :
```bash
mysql -u root -p < backend/src/db/Bdd.sql
```

**2. Backend**

```bash
cd backend
npm install
npm run dev
# → API disponible sur http://localhost:5000
```

Créer les utilisateurs de test (optionnel) :
```bash
npm run seed:users
```

**3. Frontend**

```bash
cd front
npm install
npm run dev
# → Interface disponible sur http://localhost:5173
```

---

## Configuration base de données

Fichier : `backend/src/config/db.config.js`

Les paramètres sont lus depuis les **variables d'environnement**, avec fallback sur les valeurs de développement :

```js
export default {
  HOST:     process.env.DB_HOST     || "192.168.56.102", // votre ip ici
  USER:     process.env.DB_USER     || "appAction",
  PASSWORD: process.env.DB_PASSWORD || "appAction",
  DB:       process.env.DB_NAME     || "appAction",
  PORT:     process.env.DB_PORT     || 3306,
};
```

Pour surcharger en local, copier `.env.example` en `.env` à la racine et adapter les valeurs.

---

## Routes API

Toutes les routes sont préfixées par `/api`.

exemple avec les routes crée :

| Méthode | Route | Description |
|---------|-------|-------------|
| **EMPLOYÉS** | | |
| GET | `/api/employes` | Liste tous les employés |
| GET | `/api/employes/details` | Liste avec magasin + contrat (espace RH) |
| GET | `/api/employes/email/:email` | Trouve un employé par e-mail |
| GET | `/api/employes/magasin/:magasinId` | Employés d'un magasin |
| POST | `/api/employes` | Créer un employé |
| POST | `/api/employes/login` | Connexion (retourne l'employé + ses rôles) |
| PATCH | `/api/employes/:id` | Modifier les infos RH d'un employé |
| **MAGASINS** | | |
| GET | `/api/magasins` | Liste tous les magasins |
| POST | `/api/magasins` | Créer un magasin |
| **TYPES DE CONTRAT** | | |
| GET | `/api/typeContrats` | Liste tous les types de contrat |
| POST | `/api/typeContrats` | Créer un type de contrat |
| **CONGÉS** | | |
| GET | `/api/conges` | Liste toutes les demandes (manager) |
| GET | `/api/conges/employe/:employe_id` | Congés d'un employé |
| POST | `/api/conges` | Soumettre une demande |
| PATCH | `/api/conges/:id/statut` | Valider ou refuser une demande |
| **PAIE** | | |
| GET | `/api/paie/fiches/:employe_id` | Fiches de paie d'un employé |
| POST | `/api/paie/heures-sup` | Calculer les heures supplémentaires |
| POST | `/api/paie/fiches` | Créer une fiche de paie |
| **PLANNING** | | |
| GET | `/api/plannings` | Tous les plannings (admin) |
| GET | `/api/plannings/magasin/:magasinId/semaine?debut=YYYY-MM-DD` | Planning d'un magasin pour une semaine |
| POST | `/api/plannings` | Créer un planning manuellement |
| POST | `/api/plannings/assigner-tache` | Assigner une tâche à un employé (jour précis) |
| PATCH | `/api/plannings/:id/statut` | Modifier le statut d'un planning |
| DELETE | `/api/plannings/retirer-tache` | Retirer une tâche d'un planning |
| **TÂCHES** | | |
| GET | `/api/taches` | Liste toutes les tâches (avec couleur) |
| GET | `/api/taches/couleurs` | Liste toutes les couleurs disponibles |
| POST | `/api/taches` | Créer une tâche |

---

## Arborescence complète

```
appAction--
├── backend/
│   ├── package.json
│   ├── scripts/
│   │   └── import-action-magasins.js
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── db.config.js
│       ├── controller/
│       │   ├── caisse.controller.js
│       │   ├── conge.controller.js
│       │   ├── couleurTache.controller.js
│       │   ├── declarationCasse.controller.js
│       │   ├── declaration_motif.controller.js
│       │   ├── demandeReapro.controller.js
│       │   ├── emplacement.controller.js
│       │   ├── employe.controller.js
│       │   ├── employe_role.controller.js
│       │   ├── magasin.controller.js
│       │   ├── magasin_produit.controller.js
│       │   ├── messagerie.controller.js
│       │   ├── motifCasse.controller.js
│       │   ├── paie.controller.js
│       │   ├── planning.controller.js
│       │   ├── produit.controller.js
│       │   ├── role.controller.js
│       │   ├── stock.controller.js
│       │   ├── tache_planning.controller.js
│       │   ├── tacheMag.controller.js
│       │   ├── typeCaisse.controller.js
│       │   ├── typeContrat.controller.js
│       │   └── vehicule.controller.js
│       ├── db/
│       │   ├── Bdd.sql
│       │   └── connexionBdd.js
│       ├── models/
│       │   ├── init-models.js
│       │   ├── Employe.js
│       │   ├── Magasin.js
│       │   ├── TypeContrat.js
│       │   ├── Conge.js
│       │   ├── FicheDePaie.js
│       │   ├── Planning.js
│       │   ├── TacheMag.js
│       │   ├── CouleurTache.js
│       │   ├── Role.js
│       │   └── ... (autres modèles)
│       └── routes/
│           ├── conge.routes.js
│           ├── employe.routes.js
│           ├── magasin.routes.js
│           ├── paie.routes.js
│           ├── planning.routes.js
│           ├── tacheMag.routes.js
│           └── typeContrat.routes.js
└── front/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── pages/
    │   ├── Acceuil.jsx
    │   ├── Connexion/
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── Employe/
    │   │   └── ListeEmployes.jsx
    │   ├── Conge/
    │   │   ├── DemandeConge.jsx
    │   │   └── GestionConges.jsx
    │   ├── Paie/
    │   │   └── CoffreFort.jsx
    │   ├── Planning/
    │   │   └── GestionPlanning.jsx
    │   ├── RH/
    │   │   └── EspaceRH.jsx
    │   ├── Direction/
    │   │   └── Direction.jsx
    │   └── Administrateur/
    │       └── RegisterAdmin.jsx
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── utils/
```
