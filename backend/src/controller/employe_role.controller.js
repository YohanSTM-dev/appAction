import db from "../db/connexionBdd.js";

const EmployeRole = db.models["employe_role"];

export const getAllEmployeRole = async (req, res) => {
  try {
    const allEmployeRole = await EmployeRole.findAll();
    res.status(200).json(allEmployeRole);
  } catch (error) {
    console.error("Erreur lors de la recuperation des employe_role :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des employe_role.",
    });
  }
};

export const createEmployeRole = async (req, res) => {
  try {
    const newEmployeRole = await EmployeRole.create(req.body);
    res.status(201).json(newEmployeRole);
  } catch (error) {
    console.error("Erreur lors de la creation de employe_role :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de employe_role.",
    });
  }
};

