import db from "../db/connexionBdd.js";

const Planning = db.models["Planning"];

export const getAllPlanning = async (req, res) => {
  try {
    const allPlanning = await Planning.findAll();
    res.status(200).json(allPlanning);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Planning :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Planning.",
    });
  }
};

export const createPlanning = async (req, res) => {
  try {
    const newPlanning = await Planning.create(req.body);
    res.status(201).json(newPlanning);
  } catch (error) {
    console.error("Erreur lors de la creation de Planning :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Planning.",
    });
  }
};

