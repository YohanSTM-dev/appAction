import db from "../db/connexionBdd.js";

const Stock = db.models["stock"];

export const getAllStock = async (req, res) => {
  try {
    const allStock = await Stock.findAll();
    res.status(200).json(allStock);
  } catch (error) {
    console.error("Erreur lors de la recuperation des stock :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des stock.",
    });
  }
};

export const createStock = async (req, res) => {
  try {
    const newStock = await Stock.create(req.body);
    res.status(201).json(newStock);
  } catch (error) {
    console.error("Erreur lors de la creation de stock :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de stock.",
    });
  }
};

