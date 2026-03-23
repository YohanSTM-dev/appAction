import db from "../db/connexionBdd.js";

const TacheMag = db.models["TacheMag"];

export const getAllTacheMag = async (req, res) => {
  try {
    const allTacheMag = await TacheMag.findAll();
    res.status(200).json(allTacheMag);
  } catch (error) {
    console.error("Erreur lors de la recuperation des TacheMag :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des TacheMag.",
    });
  }
};

export const createTacheMag = async (req, res) => {
  try {
    const newTacheMag = await TacheMag.create(req.body);
    res.status(201).json(newTacheMag);
  } catch (error) {
    console.error("Erreur lors de la creation de TacheMag :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de TacheMag.",
    });
  }
};

