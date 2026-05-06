import express from "express";
import {
    getAllTacheMag,
    createTacheMag,
    getAllCouleurs,
} from "../controller/tacheMag.controller.js";
import { createCouleurTache } from "../controller/couleurTache.controller.js";

const router = express.Router();

// Liste toutes les tâches (avec leur couleur)
router.get("/", getAllTacheMag);

// Toutes les couleurs disponibles (pour le formulaire de création)
router.get("/couleurs", getAllCouleurs);

// Créer une nouvelle tâche
router.post("/", createTacheMag);

router.post("/couleurs", createCouleurTache);

export default router;
