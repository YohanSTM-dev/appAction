import db from "../db/connexionBdd.js";

const TacheMag     = db.models["TacheMag"];
const CouleurTache = db.models["CouleurTache"];

// Retourne toutes les tâches avec leur couleur
// GET /api/taches
export const getAllTacheMag = async (req, res) => {
  try {
    const allTacheMag = await TacheMag.findAll({
      include: [{ model: CouleurTache, as: "couleur_tache", attributes: ["id", "couleur", "nomCouleurRep"] }],
    });
    res.status(200).json(allTacheMag);
  } catch (error) {
    console.error("Erreur lors de la recuperation des TacheMag :", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des TacheMag." });
  }
};

// Crée une nouvelle tâche (nomTache + couleur_tache_id)
// POST /api/taches
export const createTacheMag = async (req, res) => {
  try {
    const { nomTache, couleur_tache_id } = req.body;
    if (!nomTache || !couleur_tache_id) {
      return res.status(400).json({ error: "nomTache et couleur_tache_id sont requis." });
    }
    const newTacheMag = await TacheMag.create({ nomTache, couleur_tache_id: Number(couleur_tache_id) });
    res.status(201).json(newTacheMag);
  } catch (error) {
    console.error("Erreur lors de la creation de TacheMag :", error);
    res.status(500).json({ error: "Erreur lors de la creation de TacheMag." });
  }
};

// Retourne toutes les couleurs disponibles pour créer des tâches
// GET /api/taches/couleurs
export const getAllCouleurs = async (req, res) => {
  try {
    const couleurs = await CouleurTache.findAll();
    res.status(200).json(couleurs);
  } catch (error) {
    console.error("Erreur getAllCouleurs :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des couleurs." });
  }
};

