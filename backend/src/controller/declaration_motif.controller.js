import db from "../db/connexionBdd.js";

const DeclarationMotif = db.models["declaration_motif"];

export const getAllDeclarationMotif = async (req, res) => {
  try {
    const allDeclarationMotif = await DeclarationMotif.findAll();
    res.status(200).json(allDeclarationMotif);
  } catch (error) {
    console.error("Erreur lors de la recuperation des declaration_motif :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des declaration_motif.",
    });
  }
};

export const createDeclarationMotif = async (req, res) => {
  try {
    const newDeclarationMotif = await DeclarationMotif.create(req.body);
    res.status(201).json(newDeclarationMotif);
  } catch (error) {
    console.error("Erreur lors de la creation de declaration_motif :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de declaration_motif.",
    });
  }
};

