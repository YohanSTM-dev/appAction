import db from "../db/connexionBdd.js";
import bcrypt from "bcrypt";

const Employe = db.models.Employe;
const SALT_ROUNDS = 12;
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

const genererMatricule = () => {
    const randomPart = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    return `EMP${Date.now()}${randomPart}`;
};

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

export const getAllEmployes = async (req, res) => {
    try {
        const employes = await Employe.findAll();
        res.status(200).json(employes);
    } catch (error) {
        console.error("Erreur lors de la recuperation des employes :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la recuperation des employes." });
    }
};

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

export const loginEmploye = async (req, res) => {
    try {
        const { emailEmploye, mdpEmploye } = req.body;

        if (!emailEmploye || !mdpEmploye) {
            return res.status(400).json({ error: "Email et mot de passe obligatoires." });
        }

        const employe = await Employe.findOne({
            where: { emailEmploye: String(emailEmploye).trim() },
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

        res.status(200).json({
            message: "Connexion reussie.",
            employe: employeJson,
        });
    } catch (error) {
        console.error("Erreur lors de la connexion de l'employe :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la connexion." });

    }
}