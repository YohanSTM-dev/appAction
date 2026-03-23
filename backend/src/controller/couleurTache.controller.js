import db from "../db/connexionBdd.js";

const CouleurTache = db.models["CouleurTache"];

export const getAllCouleurTache = async (req, res) => {
  try {
    const allCouleurTache = await CouleurTache.findAll();
    res.status(200).json(allCouleurTache);
  } catch (error) {
    console.error("Erreur lors de la recuperation des CouleurTache :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des CouleurTache.",
    });
  }
};

export const createCouleurTache = async (req, res) => {
  try {
    const newCouleurTache = await CouleurTache.create(req.body);
    res.status(201).json(newCouleurTache);
  } catch (error) {
    console.error("Erreur lors de la creation de CouleurTache :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de CouleurTache.",
    });
  }
};

