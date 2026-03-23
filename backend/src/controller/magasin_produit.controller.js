import db from "../db/connexionBdd.js";

const MagasinProduit = db.models["magasin_produit"];

export const getAllMagasinProduit = async (req, res) => {
  try {
    const allMagasinProduit = await MagasinProduit.findAll();
    res.status(200).json(allMagasinProduit);
  } catch (error) {
    console.error("Erreur lors de la recuperation des magasin_produit :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des magasin_produit.",
    });
  }
};

export const createMagasinProduit = async (req, res) => {
  try {
    const newMagasinProduit = await MagasinProduit.create(req.body);
    res.status(201).json(newMagasinProduit);
  } catch (error) {
    console.error("Erreur lors de la creation de magasin_produit :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de magasin_produit.",
    });
  }
};

