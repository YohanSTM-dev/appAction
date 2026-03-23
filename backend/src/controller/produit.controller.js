import db from "../db/connexionBdd.js";

const Produit = db.models["Produit"];

export const getAllProduit = async (req, res) => {
  try {
    const allProduit = await Produit.findAll();
    res.status(200).json(allProduit);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Produit :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Produit.",
    });
  }
};

export const createProduit = async (req, res) => {
  try {
    const newProduit = await Produit.create(req.body);
    res.status(201).json(newProduit);
  } catch (error) {
    console.error("Erreur lors de la creation de Produit :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Produit.",
    });
  }
};

