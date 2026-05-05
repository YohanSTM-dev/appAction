import db from "../db/connexionBdd.js";

const Emplacement = db.models["Emplacement"];

export const getAllEmplacement = async (req, res) => {
  try {
    const allEmplacement = await Emplacement.findAll();
    res.status(200).json(allEmplacement);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Emplacement :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Emplacement.",
    });
  }
};

export const createEmplacement = async (req, res) => {
  try {
    const newEmplacement = await Emplacement.create(req.body);
    res.status(201).json(newEmplacement);
  } catch (error) {
    console.error("Erreur lors de la creation de Emplacement :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Emplacement.",
    });
  }
};

