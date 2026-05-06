import db from "../db/connexionBdd.js";
import bcrypt from "bcrypt";

const Employe = db.models.Employe;
const Role = db.models.Role;
const Magasin = db.models.Magasin;
const TypeContrat = db.models.TypeContrat;
const SALT_ROUNDS = 12; // Nombre de tours de hachage bcrypt (plus c'est haut, plus c'est sécurisé)
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/; // Détecte si un mot de passe est déjà haché bcrypt

/**
 * Génère un matricule candidat au format EMP{timestamp}{6 chiffres aléatoires}.
 * N'effectue aucune vérification en base — utiliser genererMatriculeUnique() pour garantir l'unicité.
 */
const genererMatricule = () => {
    const randomPart = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    return `EMP${Date.now()}${randomPart}`;
};

/**
 * Génère un matricule garanti unique en base de données.
 * Effectue jusqu'à 20 tentatives avant de lever une erreur.
 */
const genererMatriculeUnique = async () => {
    for (let index = 0; index < 20; index += 1) {
        const candidat = genererMatricule();
        const existe = await Employe.findOne({ where: { matriculeEmploye: candidat } });
        if (!existe) {
            return candidat;
        }
    }

    throw new Error("Impossible de generer un matricule unique.");
};

/**
 * Retourne la liste complète de tous les employés.
 * GET /api/employes
 */
export const getAllEmployes = async (req, res) => {
    try {
        const employes = await Employe.findAll();
        res.status(200).json(employes);
    } catch (error) {
        console.error("Erreur lors de la recuperation des employes :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la recuperation des employes." });
    }
};

/**
 * Crée un nouvel employé.
 * - Génère automatiquement le matricule si non fourni.
 * - Hache le mot de passe avec bcrypt avant insertion.
 * - Retourne l'objet créé sans le mot de passe.
 * POST /api/employes
 */
export const createEmploye = async (req, res) => {
    try {
        const payload = { ...req.body };
        const matriculeSaisi = (payload.matriculeEmploye || "").trim();
        const motDePasseClair = (payload.mdpEmploye || "").trim();

        if (!motDePasseClair) {
            return res.status(400).json({ error: "Le mot de passe est obligatoire." });
        }

        if (matriculeSaisi) {
            const dejaPris = await Employe.findOne({ where: { matriculeEmploye: matriculeSaisi } });
            if (dejaPris) {
                return res.status(409).json({ error: "Ce matricule existe deja." });
            }
            payload.matriculeEmploye = matriculeSaisi;
        } else {
            payload.matriculeEmploye = await genererMatriculeUnique();
        }

        payload.mdpEmploye = await bcrypt.hash(motDePasseClair, SALT_ROUNDS);

        const newEmploye = await Employe.create(payload);
        const employeJson = newEmploye.toJSON();
        delete employeJson.mdpEmploye;
        res.status(201).json(employeJson);
    } catch (error) {
        console.error("Erreur lors de la creation de l'employe :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la creation de l'employe." });
    }
}

/**
 * Trouve un employé via son adresse e-mail (sans exposer le mot de passe).
 * GET /api/employes/email/:email
 */
export const getEmployeByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const employe = await Employe.findOne({ where: { emailEmploye: email } });
        if (!employe) {
            return res.status(404).json({ error: "Employe non trouve." });
        }

        const employeJson = employe.toJSON();
        delete employeJson.mdpEmploye;
        res.status(200).json(employeJson);
    } catch (error) {
        console.error("Erreur lors de la recuperation de l'employe par email :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la recuperation de l'employe par email." });
    }
}

/**
 * Authentifie un employé par email + mot de passe.
 * - Compare le mot de passe avec bcrypt.
 * - Migration automatique : si l'ancien mot de passe est en clair, il est haché puis sauvegardé.
 * - Retourne l'employé sans le mot de passe, avec la liste de ses rôles (tableau plat de strings).
 * POST /api/employes/login
 */
export const loginEmploye = async (req, res) => {
    try {
        const { emailEmploye, mdpEmploye } = req.body;

        if (!emailEmploye || !mdpEmploye) {
            return res.status(400).json({ error: "Email et mot de passe obligatoires." });
        }

        // Récupère l'employé ET ses rôles en une seule requête via la table de liaison employe_role
        const employe = await Employe.findOne({
            where: { emailEmploye: String(emailEmploye).trim() },
            include: [{
                model: Role,
                as: "role_id_Roles",
                through: { attributes: [] }, // on n'expose pas les colonnes de la table de liaison
                attributes: ["id", "nomRole"],
            }],
        });

        if (!employe) {
            return res.status(401).json({ error: "Email ou mot de passe invalide." });
        }

        const motDePasseSaisi = String(mdpEmploye);
        const motDePasseStocke = String(employe.mdpEmploye || "");

        let motDePasseValide = false;
        const hashBcrypt = BCRYPT_HASH_REGEX.test(motDePasseStocke);

        if (hashBcrypt) {
            motDePasseValide = await bcrypt.compare(motDePasseSaisi, motDePasseStocke);
        } else {
            // Compatibilite temporaire pour anciens comptes non hashes.
            motDePasseValide = motDePasseSaisi === motDePasseStocke;
            if (motDePasseValide) {
                const nouveauHash = await bcrypt.hash(motDePasseSaisi, SALT_ROUNDS);
                await employe.update({ mdpEmploye: nouveauHash });
            }
        }

        if (!motDePasseValide) {
            return res.status(401).json({ error: "Email ou mot de passe invalide." });
        }

        const employeJson = employe.toJSON();
        delete employeJson.mdpEmploye;

        // Extraire les noms de rôles sous forme de tableau plat (ex: ["ROLE_ADMIN", "ROLE_EMPLOYE"])
        const roles = (employeJson.role_id_Roles || []).map((r) => r.nomRole);
        // Nettoyer l'objet imbriqué Sequelize et le remplacer par le tableau simple
        delete employeJson.role_id_Roles;
        employeJson.roles = roles;

        res.status(200).json({
            message: "Connexion reussie.",
            employe: employeJson,
        });
    } catch (error) {
        console.error("Erreur lors de la connexion de l'employe :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la connexion." });

    }
}

// Retourne tous les employés d'un magasin donné (sans le mot de passe)
// GET /api/employes/magasin/:magasinId
export const getEmployesByMagasin = async (req, res) => {
    try {
        const { magasinId } = req.params;
        const employes = await Employe.findAll({
            where: { magasin_id: Number(magasinId) },
            attributes: { exclude: ["mdpEmploye"] },
            include: [
                // On embarque le type de contrat pour afficher le créneau imposé dans le planning
                { model: TypeContrat, as: "type_contrat", attributes: ["id", "nomTypeContrat", "heureContrat", "creneau"] },
            ],
        });
        res.status(200).json(employes);
    } catch (error) {
        console.error("Erreur lors de la recuperation des employes du magasin :", error);
        res.status(500).json({ error: "Erreur lors de la recuperation des employes du magasin." });
    }
};

// Retourne tous les employés avec leurs détails magasin + contrat (pour l'espace RH)
// GET /api/employes/details
export const getAllEmployesAvecDetails = async (req, res) => {
    try {
        const employes = await Employe.findAll({
            attributes: { exclude: ["mdpEmploye"] },
            include: [
                { model: Magasin, as: "magasin", attributes: ["id", "ville", "rue"] },
                { model: TypeContrat, as: "type_contrat", attributes: ["id", "nomTypeContrat", "heureContrat"] },
            ],
        });
        res.status(200).json(employes);
    } catch (error) {
        console.error("Erreur RH récupération employés :", error);
        res.status(500).json({ error: "Erreur lors de la récupération des employés." });
    }
};

// Modifie les infos RH d'un employé (magasin, contrat, nom, prénom, email)
// PATCH /api/employes/:id
export const updateEmploye = async (req, res) => {
    try {
        const { id } = req.params;
        const employe = await Employe.findByPk(id);
        if (!employe) return res.status(404).json({ error: "Employé non trouvé." });

        // Champs modifiables par la RH (on ne touche pas au mot de passe ici)
        const { nomEmploye, prenomEmploye, emailEmploye, magasin_id, type_contrat_id, date_embauche } = req.body;
        await employe.update({ nomEmploye, prenomEmploye, emailEmploye, magasin_id, type_contrat_id, date_embauche });

        const employeJson = employe.toJSON();
        delete employeJson.mdpEmploye;
        res.status(200).json(employeJson);
    } catch (error) {
        console.error("Erreur mise à jour employé :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'employé." });
    }
};