import db from "../db/connexionBdd.js";

const TypeContrat = db.models.TypeContrat;

export const getAllTypeContrat = async (req, res) => {
  try {
    const allTypeContrat = await TypeContrat.findAll();
    res.status(200).json(allTypeContrat);
  } catch (error) {
    console.error("Erreur lors de la recuperation des types de contrats :", error);
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la recuperation des types de contrats.",
    });
  }
};

export const createTypeContrat = async (req, res) => {
  try {
    const newTypeContrat = await TypeContrat.create(req.body);
    res.status(201).json(newTypeContrat);
  } catch (error) {
    console.error("Erreur lors de la creation du type de contrat :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation du type de contrat.",
    });
  }
};
