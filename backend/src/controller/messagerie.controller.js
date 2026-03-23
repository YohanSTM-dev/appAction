import db from "../db/connexionBdd.js";

const Messagerie = db.models["Messagerie"];

export const getAllMessagerie = async (req, res) => {
  try {
    const allMessagerie = await Messagerie.findAll();
    res.status(200).json(allMessagerie);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Messagerie :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Messagerie.",
    });
  }
};

export const createMessagerie = async (req, res) => {
  try {
    const newMessagerie = await Messagerie.create(req.body);
    res.status(201).json(newMessagerie);
  } catch (error) {
    console.error("Erreur lors de la creation de Messagerie :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Messagerie.",
    });
  }
};

