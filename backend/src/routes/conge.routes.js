import express from "express";
import {
    createConge,
    getAllConges,
    getCongesByEmploye,
    updateStatutConge,
} from "../controller/conge.controller.js";

const router = express.Router();

// Soumettre une demande de congé
router.post("/", createConge);

// Lister toutes les demandes (manager)
router.get("/", getAllConges);

// Lister les congés d'un employé spécifique
router.get("/employe/:employe_id", getCongesByEmploye);

// Valider ou refuser un congé
router.patch("/:id/statut", updateStatutConge);

export default router;
