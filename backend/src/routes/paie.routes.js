import express from "express";
import {
    calculerHeureSup,
    getFichesDePaieByEmploye,
    createFicheDePaie,
} from "../controller/paie.controller.js";

const router = express.Router();

// Calculer les heures supplémentaires d'un employé pour un mois/année
router.post("/heures-sup", calculerHeureSup);

// Lister les fiches de paie d'un employé
router.get("/fiches/:employe_id", getFichesDePaieByEmploye);

// Créer une fiche de paie
router.post("/fiches", createFicheDePaie);

export default router;
