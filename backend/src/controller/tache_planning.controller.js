import db from "../db/connexionBdd.js";

const TachePlanning = db.models["tache_planning"];

export const getAllTachePlanning = async (req, res) => {
  try {
    const allTachePlanning = await TachePlanning.findAll();
    res.status(200).json(allTachePlanning);
  } catch (error) {
    console.error("Erreur lors de la recuperation des tache_planning :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des tache_planning.",
    });
  }
};

export const createTachePlanning = async (req, res) => {
  try {
    const newTachePlanning = await TachePlanning.create(req.body);
    res.status(201).json(newTachePlanning);
  } catch (error) {
    console.error("Erreur lors de la creation de tache_planning :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de tache_planning.",
    });
  }
};

