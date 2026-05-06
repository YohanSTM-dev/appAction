# Fonctionnalités — appAction

> Application de gestion de magasin(s) : plannings, employés, congés, paie, tâches.

---

## Sommaire

1. [Rôles et accès](#1-rôles-et-accès)
2. [Connexion & Authentification](#2-connexion--authentification)
3. [Accueil — vue par rôle](#3-accueil--vue-par-rôle)
4. [Mon planning (Employé)](#4-mon-planning-employé)
5. [Gestion du planning (Responsable / Admin)](#5-gestion-du-planning-responsable--admin)
   - [Créneaux matin / soir](#créneaux-matin--soir)
   - [Règle des 2 jours de repos](#règle-des-2-jours-de-repos)
6. [Congés](#6-congés)
7. [Paie & Coffre-fort numérique](#7-paie--coffre-fort-numérique)
8. [Espace RH](#8-espace-rh)
9. [Direction (Admin)](#9-direction-admin)
10. [Migrations base de données](#10-migrations-base-de-données)

---

## 1. Rôles et accès

L'application utilise un système RBAC (contrôle d'accès par rôle).  
Chaque employé peut avoir un ou plusieurs rôles simultanément.

| Rôle | Accès |
|------|-------|
| **Employé** (défaut) | Mon planning, Mes congés, Fiches de paie |
| **Manager / Responsable** | Tout Employé + Gestion planning, Gestion congés équipe |
| **RH** | Tout Employé + Espace RH (employés, contrats) |
| **Admin** | Accès total : tout RH + tout Manager + Direction + Création de comptes admin |

> La redirection après connexion est automatique selon le rôle le plus élevé :
> Admin → `/direction` · RH → `/rh` · Manager → `/planning/gestion` · Employé → `/acceuil`

---

## 2. Connexion & Authentification

- Connexion par **email + mot de passe**.
- Les mots de passe sont **hachés avec bcrypt** (12 tours de salage).
- **Migration automatique** : si un ancien compte a un mot de passe en clair, il est haché automatiquement lors de la première connexion.
- L'employé connecté est stocké dans le **localStorage** (objet JSON avec ses rôles).
- Toutes les pages sont protégées : une redirection vers `/login` s'applique si non connecté.
- Les routes sont filtrées par rôle côté front — un employé ne peut pas accéder aux pages Manager/RH/Admin même en tapant l'URL.

---

## 3. Accueil — vue par rôle

La page d'accueil affiche uniquement les tuiles auxquelles l'employé a accès.

### Espace personnel (tous les employés)

| Tuile | Destination |
|-------|-------------|
| 📅 Mon planning | Ma semaine de travail (lecture seule) |
| 🗓 Mes congés | Poser une demande de congé |
| 🗄️ Fiches de paie | Coffre-fort numérique |

### Espace Manager (Manager + Admin)

| Tuile | Destination |
|-------|-------------|
| 📅 Planning | Gestion planning du magasin |
| 📋 Congés équipe | Valider / refuser les demandes |

### Espace RH (RH + Admin)

| Tuile | Destination |
|-------|-------------|
| 👥 Espace RH | Gestion des employés et contrats |

### Espace Direction (Admin uniquement)

| Tuile | Destination |
|-------|-------------|
| 🏢 Direction | Vue d'ensemble globale |
| 🔐 Admin | Créer un compte administrateur |

---

## 4. Mon planning (Employé)

> Route : `/planning/mon-planning` — accessible à tous les employés connectés.

L'employé voit **sa propre semaine** en lecture seule.

- Navigation semaine précédente / suivante / Aujourd'hui.
- **Résumé en haut** : nombre de jours travaillés (max 5) et jours de repos.
- Chaque jour affiché avec :
  - Le **créneau** (☀️ Matin ou 🌙 Soir) si planifié.
  - Les **tâches assignées** (badges colorés).
  - Badge **😴 Repos** si le jour n'est pas planifié.
- Le jour courant est mis en évidence (bordure bleue).

---

## 5. Gestion du planning (Responsable / Admin)

> Route : `/planning/gestion` — accessible aux Managers et Admins uniquement.

Le responsable voit la **grille planning du magasin** pour la semaine sélectionnée.

- Tous les employés du magasin apparaissent en lignes.
- Les 7 jours de la semaine en colonnes.
- **Navigation semaine** : précédente / suivante / Aujourd'hui.

### Assigner une tâche à un employé

1. Cliquer sur une cellule (employé × jour).
2. Un **modal en 2 étapes** s'ouvre :
   - **Étape 1 — Créneau** : choisir ☀️ Matin ou 🌙 Soir.
   - **Étape 2 — Tâche** : choisir parmi le catalogue de tâches colorées.
3. La cellule se colore selon le créneau (jaune = matin, violet = soir).
4. Cliquer sur une tâche déjà assignée (badge) la **retire** du planning.

### Créneaux matin / soir

Chaque **type de contrat** peut imposer un créneau (`matin` ou `soir`).  
Si le contrat impose un créneau :
- Le bouton de l'autre créneau est **grisé et désactivé** dans le modal.
- Le créneau imposé est affiché sous le nom de l'employé dans la grille.
- Tenter d'assigner le mauvais créneau via l'API retourne une erreur `409`.

Si le contrat est flexible (`null`), le responsable choisit librement.

### Règle des 2 jours de repos

> Un employé **doit avoir au moins 2 jours de repos par semaine**, soit 5 jours travaillés maximum.

- La colonne **"Repos / sem."** affiche un badge par employé :
  - 🟢 Vert : ≥ 2 jours de repos (règle respectée).
  - 🔴 Rouge : < 2 jours de repos (attention !).
- Si l'employé a atteint 5 jours planifiés, les cellules restantes sont **grisées** et affichent "repos" — impossible de cliquer.
- Côté API, tenter de dépasser 5 jours retourne une erreur `422` avec un message explicite.

### Catalogue de tâches

En bas de la page (section dépliable) :
- Affiche toutes les tâches existantes avec leur couleur.
- Formulaire pour **créer une nouvelle tâche** (nom + couleur/priorité).

---

## 6. Congés

### Demande de congé (Employé)

> Route : `/conge/demande`

- Formulaire : date de début, date de fin, motif (optionnel).
- Validation : la date de fin ne peut pas être avant la date de début.
- Le statut est automatiquement **"En attente"** à la création.
- L'employé peut voir l'historique de ses propres demandes.

### Gestion des congés (Manager / Admin)

> Route : `/conge/gestion`

- Liste toutes les demandes avec nom, prénom, matricule de l'employé.
- Actions : **Valider** ou **Refuser** chaque demande (boutons par ligne).
- Seuls les statuts `Validé` et `Refusé` sont acceptés (l'API rejette tout autre valeur).

---

## 7. Paie & Coffre-fort numérique

### Coffre-fort (Employé)

> Route : `/paie/coffre-fort`

- Affiche toutes les fiches de paie de l'employé connecté.
- Triées du plus récent au plus ancien.
- Chaque fiche : mois, année, montant net, heures travaillées, heures supplémentaires.

### Calcul des heures supplémentaires (API interne)

> `POST /api/paie/heures-sup` — Body : `{ employe_id, mois, annee }`

- Récupère les plannings du mois (jours × 8h/jour ouvré lun-ven).
- Compare aux heures théoriques du contrat (heures hebdo × 4,33 semaines/mois).
- Retourne : `heuresEffectuees`, `heuresContratMois`, `heuresSupplementaires`.

---

## 8. Espace RH

> Route : `/rh` — accessible aux RH et Admins uniquement.

- Liste tous les employés avec leurs détails : **magasin, type de contrat**.
- Possibilité de **modifier les infos RH** d'un employé (nom, prénom, email, magasin, contrat, date d'embauche).
- Le mot de passe n'est **jamais exposé** ni modifiable depuis cet écran.

---

## 9. Direction (Admin)

> Route : `/direction` — accessible aux Admins uniquement.

- Vue d'ensemble globale de l'application.

### Création de comptes admin

> Route : `/admin`

- Formulaire de création d'un compte avec le rôle Admin.

---

## 10. Migrations base de données

Pour une base existante, exécuter ces requêtes SQL (une seule fois) :

```sql
-- Ajout du créneau sur le planning
ALTER TABLE Planning ADD COLUMN creneau ENUM('matin','soir') NULL AFTER statut;

-- Ajout du créneau imposé sur le type de contrat
ALTER TABLE TypeContrat ADD COLUMN creneau ENUM('matin','soir') NULL;

-- Exemple : affecter un créneau aux contrats existants
UPDATE TypeContrat SET creneau = 'matin' WHERE nomTypeContrat LIKE '%matin%';
UPDATE TypeContrat SET creneau = 'soir'  WHERE nomTypeContrat LIKE '%soir%';
-- Les contrats sans créneau restent NULL (flexible)

-- Pour l'unicité du matricule (si pas encore fait)
ALTER TABLE Employe MODIFY COLUMN matriculeEmploye VARCHAR(50) NOT NULL;
ALTER TABLE Employe ADD CONSTRAINT UQ_Employe_matriculeEmploye UNIQUE (matriculeEmploye);
```

---

## Règles métier résumées

| Règle | Détail |
|-------|--------|
| Mot de passe | Haché bcrypt 12 tours, jamais exposé dans les réponses API |
| Matricule | Auto-généré si absent (`EMP{timestamp}{6 chiffres}`), unicité garantie |
| Créneau contrat | Si le contrat impose matin ou soir, impossible d'assigner l'autre |
| Repos hebdo | Maximum 5 jours travaillés / semaine (2 jours de repos minimum) |
| Congé | `dateDebut ≤ dateFin` obligatoire ; statut initial = "En attente" |
| Rôles | RBAC : les routes front et API vérifient le rôle avant d'autoriser |
