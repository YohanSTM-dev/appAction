import db from "../db/connexionBdd.js";

const TypeCaisse = db.models["TypeCaisse"];

export const getAllTypeCaisse = async (req, res) => {
  try {
    const allTypeCaisse = await TypeCaisse.findAll();
    res.status(200).json(allTypeCaisse);
  } catch (error) {
    console.error("Erreur lors de la recuperation des TypeCaisse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des TypeCaisse.",
    });
  }
};

export const createTypeCaisse = async (req, res) => {
  try {
    const newTypeCaisse = await TypeCaisse.create(req.body);
    res.status(201).json(newTypeCaisse);
  } catch (error) {
    console.error("Erreur lors de la creation de TypeCaisse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de TypeCaisse.",
    });
  }
};

