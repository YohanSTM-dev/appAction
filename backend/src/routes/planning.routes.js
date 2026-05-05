import express from "express";
import {
    getAllPlanning,
    createPlanning,
    getPlanningsSemaine,
    assignerTache,
    retirerTache,
    updateStatutPlanning,
} from "../controller/planning.controller.js";

const router = express.Router();

// Tous les plannings (admin)
router.get("/", getAllPlanning);

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
