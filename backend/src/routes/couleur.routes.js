import express from "express";
import { 
    createCouleur, 
    getAllCouleurs 
} from "../controller/couleur.controller.js";

const router = express.Router();

// Récupérer toutes les couleurs de tâches
router.get("/couleurs", getAllCouleurs);
router.post("/couleurs", createCouleur);

export default router;