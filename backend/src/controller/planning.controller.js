import db from "../db/connexionBdd.js";
import { Op } from "sequelize";

const Planning     = db.models["Planning"];
const Employe      = db.models["Employe"];
const TacheMag     = db.models["TacheMag"];
const CouleurTache = db.models["CouleurTache"];
const tache_planning = db.models["tache_planning"];

export const getAllPlanning = async (req, res) => {
  try {
    const allPlanning = await Planning.findAll();
    res.status(200).json(allPlanning);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Planning :", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des Planning." });
  }
};

/**
 * Retourne tous les plannings d'un magasin pour une semaine donnée,
 * avec les employés et leurs tâches colorées.
 * GET /api/plannings/magasin/:magasinId/semaine?debut=YYYY-MM-DD
 * 
 * On crée un Planning par employé par jour (dateDebut = dateFin = jour).
 * Ça permet d'avoir une vraie vue jour par jour.
 */
export const getPlanningsSemaine = async (req, res) => {
  try {
    const { magasinId } = req.params;
    const { debut } = req.query; // ex: "2026-05-04" (lundi de la semaine)

    if (!debut) return res.status(400).json({ error: "Le paramètre 'debut' est requis (YYYY-MM-DD)." });

    // On calcule les 7 jours de la semaine
    const lundi = new Date(debut);
    const dimanche = new Date(debut);
    dimanche.setDate(dimanche.getDate() + 6);

    const plannings = await Planning.findAll({
      where: {
        dateDebut: { [Op.between]: [lundi, dimanche] },
      },
      include: [
        {
          model: Employe,
          as: "employe",
          where: { magasin_id: Number(magasinId) },
          attributes: ["id", "nomEmploye", "prenomEmploye"],
        },
        {
          // Tâches assignées à ce planning via la table de liaison tache_planning
          model: TacheMag,
          as: "tache_id_TacheMags",
          through: { attributes: [] },
          include: [{ model: CouleurTache, as: "couleur_tache", attributes: ["couleur", "nomCouleurRep"] }],
        },
      ],
    });

    res.status(200).json(plannings);
  } catch (error) {
    console.error("Erreur getPlanningsSemaine :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des plannings de la semaine." });
  }
};

/**
 * Assigne une tâche à un employé pour un jour précis.
 * Si le planning du jour n'existe pas encore, on le crée automatiquement.
 * POST /api/plannings/assigner-tache
 * Body: { employe_id, date, tache_id }
 */
export const assignerTache = async (req, res) => {
  try {
    const { employe_id, date, tache_id } = req.body;

    if (!employe_id || !date || !tache_id) {
      return res.status(400).json({ error: "employe_id, date et tache_id sont requis." });
    }

    // Trouve ou crée le planning de l'employé pour ce jour précis
    const [planning] = await Planning.findOrCreate({
      where: { employe_id: Number(employe_id), dateDebut: date, dateFin: date },
      defaults: { employe_id: Number(employe_id), dateDebut: date, dateFin: date, statut: "en_cours" },
    });

    // Ajoute la tâche au planning (ignore si déjà présente)
    await tache_planning.findOrCreate({
      where: { planning_id: planning.id, tache_id: Number(tache_id) },
    });

    res.status(200).json({ message: "Tâche assignée.", planning_id: planning.id });
  } catch (error) {
    console.error("Erreur assignerTache :", error);
    res.status(500).json({ error: "Erreur lors de l'assignation de la tâche." });
  }
};

/**
 * Retire une tâche d'un planning (suppression dans tache_planning).
 * DELETE /api/plannings/retirer-tache
 * Body: { employe_id, date, tache_id }
 */
export const retirerTache = async (req, res) => {
  try {
    const { employe_id, date, tache_id } = req.body;

    const planning = await Planning.findOne({
      where: { employe_id: Number(employe_id), dateDebut: date, dateFin: date },
    });

    if (!planning) return res.status(404).json({ error: "Planning non trouvé pour ce jour." });

    await tache_planning.destroy({
      where: { planning_id: planning.id, tache_id: Number(tache_id) },
    });

    res.status(200).json({ message: "Tâche retirée." });
  } catch (error) {
    console.error("Erreur retirerTache :", error);
    res.status(500).json({ error: "Erreur lors du retrait de la tâche." });
  }
};

export const createPlanning = async (req, res) => {
  try {
    const newPlanning = await Planning.create(req.body);
    res.status(201).json(newPlanning);
  } catch (error) {
    console.error("Erreur lors de la creation de Planning :", error);
    res.status(500).json({ error: "Erreur lors de la creation de Planning." });
  }
};

export const updateStatutPlanning = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const planning = await Planning.findByPk(id);
    if (!planning) return res.status(404).json({ error: "Planning non trouve." });
    await planning.update({ statut });
    res.status(200).json(planning);
  } catch (error) {
    console.error("Erreur updateStatutPlanning :", error);
    res.status(500).json({ error: "Erreur lors de la mise a jour du statut." });
  }
};

