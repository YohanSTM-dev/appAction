import db from "../db/connexionBdd.js";

const MotifCasse = db.models["MotifCasse"];

export const getAllMotifCasse = async (req, res) => {
  try {
    const allMotifCasse = await MotifCasse.findAll();
    res.status(200).json(allMotifCasse);
  } catch (error) {
    console.error("Erreur lors de la recuperation des MotifCasse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des MotifCasse.",
    });
  }
};

export const createMotifCasse = async (req, res) => {
  try {
    const newMotifCasse = await MotifCasse.create(req.body);
    res.status(201).json(newMotifCasse);
  } catch (error) {
    console.error("Erreur lors de la creation de MotifCasse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de MotifCasse.",
    });
  }
};

