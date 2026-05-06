import express from "express";
import {
    getAllPlanning,
    createPlanning,
    getPlanningsSemaine,
    getPlanningEmploye,
    assignerTache,
    retirerTache,
    updateStatutPlanning,
} from "../controller/planning.controller.js";

const router = express.Router();

// Tous les plannings (admin)
router.get("/", getAllPlanning);

// Planning d'un employé pour sa propre semaine (vue lecture seule)
router.get("/employe/:employeId/semaine", getPlanningEmploye);

// Plannings d'un magasin pour une semaine : ?debut=YYYY-MM-DD
router.get("/magasin/:magasinId/semaine", getPlanningsSemaine);

// Assigner une tâche à un employé pour un jour (crée le planning si besoin)
router.post("/assigner-tache", assignerTache);

// Retirer une tâche d'un jour
router.delete("/retirer-tache", retirerTache);

// Créer un planning manuellement
router.post("/", createPlanning);

// Modifier le statut d'un planning
router.patch("/:id/statut", updateStatutPlanning);

export default router;
