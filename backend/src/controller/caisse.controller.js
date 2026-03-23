import db from "../db/connexionBdd.js";

const Caisse = db.models["Caisse"];

export const getAllCaisse = async (req, res) => {
  try {
    const allCaisse = await Caisse.findAll();
    res.status(200).json(allCaisse);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Caisse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Caisse.",
    });
  }
};

export const createCaisse = async (req, res) => {
  try {
    const newCaisse = await Caisse.create(req.body);
    res.status(201).json(newCaisse);
  } catch (error) {
    console.error("Erreur lors de la creation de Caisse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Caisse.",
    });
  }
};

