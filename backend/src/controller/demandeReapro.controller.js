import db from "../db/connexionBdd.js";

const DemandeReapro = db.models["DemandeReapro"];

export const getAllDemandeReapro = async (req, res) => {
  try {
    const allDemandeReapro = await DemandeReapro.findAll();
    res.status(200).json(allDemandeReapro);
  } catch (error) {
    console.error("Erreur lors de la recuperation des DemandeReapro :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des DemandeReapro.",
    });
  }
};

export const createDemandeReapro = async (req, res) => {
  try {
    const newDemandeReapro = await DemandeReapro.create(req.body);
    res.status(201).json(newDemandeReapro);
  } catch (error) {
    console.error("Erreur lors de la creation de DemandeReapro :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de DemandeReapro.",
    });
  }
};

