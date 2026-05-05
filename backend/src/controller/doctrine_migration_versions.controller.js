import db from "../db/connexionBdd.js";

const DoctrineMigrationVersions = db.models["doctrine_migration_versions"];

export const getAllDoctrineMigrationVersions = async (req, res) => {
  try {
    const allDoctrineMigrationVersions = await DoctrineMigrationVersions.findAll();
    res.status(200).json(allDoctrineMigrationVersions);
  } catch (error) {
    console.error("Erreur lors de la recuperation des doctrine_migration_versions :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la recuperation des doctrine_migration_versions.",
    });
  }
};

export const createDoctrineMigrationVersions = async (req, res) => {
  try {
    const newDoctrineMigrationVersions = await DoctrineMigrationVersions.create(req.body);
    res.status(201).json(newDoctrineMigrationVersions);
  } catch (error) {
    console.error("Erreur lors de la creation de doctrine_migration_versions :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de la creation de doctrine_migration_versions.",
    });
  }
};

