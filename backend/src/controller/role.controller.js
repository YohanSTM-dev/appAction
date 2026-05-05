import db from "../db/connexionBdd.js";

const Role = db.models["Role"];

export const getAllRole = async (req, res) => {
  try {
    const allRole = await Role.findAll();
    res.status(200).json(allRole);
  } catch (error) {
    console.error("Erreur lors de la recuperation des Role :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des Role.",
    });
  }
};

export const createRole = async (req, res) => {
  try {
    const newRole = await Role.create(req.body);
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Erreur lors de la creation de Role :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de Role.",
    });
  }
};

