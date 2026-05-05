import db from "../db/connexionBdd.js";

const DeclarationCasse = db.models["DeclarationCasse"];

export const getAllDeclarationCasse = async (req, res) => {
  try {
    const allDeclarationCasse = await DeclarationCasse.findAll();
    res.status(200).json(allDeclarationCasse);
  } catch (error) {
    console.error("Erreur lors de la recuperation des DeclarationCasse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des DeclarationCasse.",
    });
  }
}; 

export const createDeclarationCasse = async (req, res) => {
  try {
    const newDeclarationCasse = await DeclarationCasse.create(req.body);
    res.status(201).json(newDeclarationCasse);
  } catch (error) {
    console.error("Erreur lors de la creation de DeclarationCasse :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de DeclarationCasse.",
    });
  }
};

