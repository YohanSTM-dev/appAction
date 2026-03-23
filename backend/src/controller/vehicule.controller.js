import db from "../db/connexionBdd.js";

const Vehicule = db.models["Vehicule"];

export const getAllVehicule = async (req, res) => {
  try {
    const allVehicule = await Vehicule.findAll();
    res.status(200).json(allVehicule);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Vehicule :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Vehicule.",
    });
  }
};

export const createVehicule = async (req, res) => {
  try {
    const newVehicule = await Vehicule.create(req.body);
    res.status(201).json(newVehicule);
  } catch (error) {
    console.error("Erreur lors de la creation de Vehicule :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Vehicule.",
    });
  }
};

