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

## Installation & démarrage

Il y a deux façons de lancer le projet.

---

### Méthode 1 — Docker (recommandé, sans base de données à configurer)

**Prérequis :** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé.

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
| Frontend | http://localhost:3000 |
| API backend | http://localhost:5000/api |
| MySQL (optionnel) | localhost:**3307** |

**Comptes de test disponibles :**

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Employé | jean.dupont@action.fr | Employe2024! |
| Manager | sophie.martin@action.fr | Manager2024! |
| RH | claire.bernard@action.fr | RH2024! |
| Admin | thomas.leroy@action.fr | Admin2024! |

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
  HOST:     process.env.DB_HOST     || "192.168.56.102",
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

## Détail des modules

### Employés

**Fichiers** : `controller/employe.controller.js` · `routes/employe.routes.js`

| Fonction | Description |
|----------|-------------|
| `genererMatricule()` | Génère un matricule aléatoire au format `EMP{timestamp}{6 chiffres}` |
| `genererMatriculeUnique()` | Appelle `genererMatricule()` en boucle (max 20 essais) jusqu'à trouver un matricule libre en base |
| `getAllEmployes` | Retourne la liste complète des employés |
| `getAllEmployesAvecDetails` | Retourne les employés avec leur magasin et leur type de contrat (pour l'espace RH) — le mot de passe est exclu |
| `getEmployeByEmail` | Trouve un employé via son adresse e-mail |
| `getEmployesByMagasin` | Retourne tous les employés affectés à un magasin donné |
| `createEmploye` | Crée un employé : génère le matricule si absent, hache le mot de passe avec bcrypt (12 tours), retourne l'objet sans le mot de passe |
| `loginEmploye` | Authentifie un employé : compare le mot de passe avec bcrypt, migre automatiquement les anciens comptes non hachés, retourne l'employé + la liste de ses rôles |
| `updateEmploye` | Met à jour les infos RH (nom, prénom, e-mail, magasin, contrat, date d'embauche) — ne touche pas au mot de passe |

---

### Magasins

**Fichiers** : `controller/magasin.controller.js` · `routes/magasin.routes.js`

| Fonction | Description |
|----------|-------------|
| `getAllMagasins` | Retourne la liste de tous les magasins |
| `createMagasin` | Crée un nouveau magasin depuis le body de la requête |

---

### Types de contrat

**Fichiers** : `controller/typeContrat.controller.js` · `routes/typeContrat.routes.js`

| Fonction | Description |
|----------|-------------|
| `getAllTypeContrat` | Retourne tous les types de contrat |
| `createTypeContrat` | Crée un nouveau type de contrat |

---

### Congés

**Fichiers** : `controller/conge.controller.js` · `routes/conge.routes.js`

| Fonction | Description |
|----------|-------------|
| `createConge` | Crée une demande de congé avec le statut `"En attente"` — valide que `dateDebut ≤ dateFin` |
| `getAllConges` | Retourne toutes les demandes avec les infos de l'employé (nom, prénom, matricule) — utilisé par le manager |
| `getCongesByEmploye` | Retourne les demandes d'un employé spécifique via son `employe_id` |
| `updateStatutConge` | Met le statut d'une demande à `"Validé"` ou `"Refusé"` |

---

### Paie

**Fichiers** : `controller/paie.controller.js` · `routes/paie.routes.js`

| Fonction | Description |
|----------|-------------|
| `calculerJoursOuvres(dateDebut, dateFin)` | *(interne)* Compte les jours du lundi au vendredi entre deux dates |
| `extraireHeuresContrat(heureContrat)` | *(interne)* Extrait l'entier depuis un champ texte comme `"35h"` ou `"35 heures"` |
| `calculerHeureSup` | Calcule les heures supplémentaires d'un employé pour un mois/année : compare les heures effectuées (plannings du mois × 8h/jour ouvré) au contrat théorique (hebdo × 4,33) |
| `getFichesDePaieByEmploye` | Retourne toutes les fiches de paie d'un employé, triées du plus récent au plus ancien |
| `createFicheDePaie` | Enregistre une fiche de paie en base (montant net, heures travaillées, heures sup) |

---

### Planning

**Fichiers** : `controller/planning.controller.js` · `routes/planning.routes.js`

| Fonction | Description |
|----------|-------------|
| `getAllPlanning` | Retourne tous les plannings (sans filtre) |
| `getPlanningsSemaine` | Retourne les plannings d'un magasin pour les 7 jours à partir d'une date `debut` — inclut l'employé et ses tâches avec couleur |
| `assignerTache` | Assigne une tâche à un employé pour un jour précis — crée automatiquement le planning du jour s'il n'existe pas (`findOrCreate`) |
| `retirerTache` | Supprime l'association tâche/planning dans la table `tache_planning` |
| `createPlanning` | Crée un planning manuellement depuis le body |
| `updateStatutPlanning` | Met à jour le statut d'un planning (`en_cours`, `terminé`, etc.) |

---

### Tâches

**Fichiers** : `controller/tacheMag.controller.js` · `routes/tacheMag.routes.js`

| Fonction | Description |
|----------|-------------|
| `getAllTacheMag` | Retourne toutes les tâches avec leur couleur associée |
| `createTacheMag` | Crée une tâche — requiert `nomTache` et `couleur_tache_id` |
| `getAllCouleurs` | Retourne toutes les couleurs disponibles (pour le formulaire de création de tâche) |

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
