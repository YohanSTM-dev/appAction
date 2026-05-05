import db from "../db/connexionBdd.js";

const Conge = db.models.Conge;
const Employe = db.models.Employe;

// Créer une demande de congé (statut "En attente" par défaut)
export const createConge = async (req, res) => {
    try {
        const { dateDebut, dateFin, motif, employe_id } = req.body;

        // Validation des champs obligatoires
        if (!dateDebut || !dateFin || !employe_id) {
            return res.status(400).json({ error: "dateDebut, dateFin et employe_id sont obligatoires." });
        }

        // La date de fin doit être >= à la date de début
        if (new Date(dateFin) < new Date(dateDebut)) {
            return res.status(400).json({ error: "La date de fin ne peut pas être avant la date de début." });
        }

        const conge = await Conge.create({
            dateDebut,
            dateFin,
            motif: motif || null,
            statut: "En attente",
            employe_id,
        });

        res.status(201).json(conge);
    } catch (error) {
        console.error("Erreur lors de la création du congé :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la création du congé." });
    }
};

// Récupérer toutes les demandes de congé avec les infos de l'employé (pour le manager)
export const getAllConges = async (req, res) => {
    try {
        const conges = await Conge.findAll({
            include: [{
                model: Employe,
                as: "employe",
                attributes: ["id", "nomEmploye", "prenomEmploye", "matriculeEmploye"],
            }],
            order: [["id", "DESC"]],
        });

        res.status(200).json(conges);
    } catch (error) {
        console.error("Erreur lors de la récupération des congés :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des congés." });
    }
};

// Récupérer les congés d'un employé spécifique
export const getCongesByEmploye = async (req, res) => {
    try {
        const { employe_id } = req.params;

        const conges = await Conge.findAll({
            where: { employe_id },
            order: [["id", "DESC"]],
        });

        res.status(200).json(conges);
    } catch (error) {
        console.error("Erreur lors de la récupération des congés de l'employé :", error);
        res.status(500).json({ error: "Une erreur est survenue." });
    }
};

// Valider ou refuser un congé (Validé / Refusé)
export const updateStatutConge = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        // Seuls ces deux statuts sont acceptés après traitement
        const statutsValides = ["Validé", "Refusé"];
        if (!statutsValides.includes(statut)) {
            return res.status(400).json({ error: "Statut invalide. Valeurs acceptées : Validé, Refusé." });
        }

        const conge = await Conge.findByPk(id);
        if (!conge) {
            return res.status(404).json({ error: "Congé introuvable." });
        }

        // Mise à jour du statut en base
        await conge.update({ statut });

        res.status(200).json({ message: `Congé ${statut} avec succès.`, conge });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut du congé :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour." });
    }
};
