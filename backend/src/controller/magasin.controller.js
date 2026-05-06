import db from "../db/connexionBdd.js";

const Magasin = db.models.Magasin;

/**
 * Retourne la liste de tous les magasins.
 * GET /api/magasins
 */
export const getAllMagasins = async (req, res) => {
    try{
    const listeMagasins = await Magasin.findAll();
    res.status(200).json(listeMagasins);
    } catch(error){
        console.error("Erreur lors de la recuperation des Magasins :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la recuperation des Magasins." });
    }
}

/**
 * Crée un nouveau magasin depuis le body de la requête.
 * POST /api/magasins
 */
export const createMagasin = async (req, res) => {
    try{
        const newMagasin = await Magasin.create(req.body);
        res.status(201).json(newMagasin);
    } catch(error){
        console.error("Erreur lors de la création du magasin :", error);
        res.status(500).json({ error: "Une erreur est survenue lors de la création du magasin." });
    }
}