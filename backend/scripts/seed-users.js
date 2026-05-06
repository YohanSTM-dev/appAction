/**
 * Seed des utilisateurs de test
 * Lance avec : npm run seed:users
 *
 * Crée 4 employés (un par rôle) dans le magasin d'id 1.
 * Adapte magasin_id et type_contrat_id selon ta BDD.
 */

import bcrypt from "bcrypt";
import db from "../src/db/connexionBdd.js";

const SALT_ROUNDS = 12;

// ── Utilisateurs à créer ──────────────────────────────────────────────────────
// mot de passe clair → sera hashé avant insertion
const USERS = [
  {
    nomEmploye:       "Dupont",
    prenomEmploye:    "Jean",
    matriculeEmploye: "EMP-001",
    emailEmploye:     "jean.dupont@action.fr",
    mdpClair:         "Employe2024!",
    date_embauche:    "2023-03-15",
    magasin_id:       1,
    type_contrat_id:  1,
    role_id:          1, // Employé
  },
  {
    nomEmploye:       "Martin",
    prenomEmploye:    "Sophie",
    matriculeEmploye: "EMP-002",
    emailEmploye:     "sophie.martin@action.fr",
    mdpClair:         "Manager2024!",
    date_embauche:    "2021-09-01",
    magasin_id:       1,
    type_contrat_id:  1,
    role_id:          2, // Manager
  },
  {
    nomEmploye:       "Bernard",
    prenomEmploye:    "Claire",
    matriculeEmploye: "EMP-003",
    emailEmploye:     "claire.bernard@action.fr",
    mdpClair:         "RH2024!",
    date_embauche:    "2020-06-20",
    magasin_id:       1,
    type_contrat_id:  1,
    role_id:          3, // RH
  },
  {
    nomEmploye:       "Leroy",
    prenomEmploye:    "Thomas",
    matriculeEmploye: "EMP-004",
    emailEmploye:     "thomas.leroy@action.fr",
    mdpClair:         "Admin2024!",
    date_embauche:    "2019-01-10",
    magasin_id:       1,
    type_contrat_id:  1,
    role_id:          4, // Administrateur
  },
];

// ── Insertion ────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log("✔  Connexion BDD OK");

    const { Employe, employe_role } = db.models;

    for (const u of USERS) {
      // Hash du mot de passe
      const mdpHash = await bcrypt.hash(u.mdpClair, SALT_ROUNDS);

      // Vérifier si le matricule existe déjà pour ne pas dupliquer
      const existant = await Employe.findOne({ where: { matriculeEmploye: u.matriculeEmploye } });
      if (existant) {
        console.log(`⚠  ${u.matriculeEmploye} existe déjà, ignoré.`);
        continue;
      }

      // Créer l'employé
      const employe = await Employe.create({
        nomEmploye:       u.nomEmploye,
        prenomEmploye:    u.prenomEmploye,
        matriculeEmploye: u.matriculeEmploye,
        emailEmploye:     u.emailEmploye,
        mdpEmploye:       mdpHash,
        date_embauche:    u.date_embauche,
        magasin_id:       u.magasin_id,
        type_contrat_id:  u.type_contrat_id,
      });

      // Lier au rôle
      await employe_role.create({ employe_id: employe.id, role_id: u.role_id });

      console.log(`✔  Créé : ${u.prenomEmploye} ${u.nomEmploye} (rôle ${u.role_id}) — mdp : ${u.mdpClair}`);
    }

    console.log("\nSeed terminé.");
  } catch (err) {
    console.error("Erreur seed :", err.message);
  } finally {
    await db.sequelize.close();
  }
}

seed();
