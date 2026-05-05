import express from "express";
import {
	createEmploye,
	getAllEmployes,
	getAllEmployesAvecDetails,
	getEmployeByEmail,
	getEmployesByMagasin,
	loginEmploye,
	updateEmploye,
} from "../controller/employe.controller.js";

const router = express.Router();

router.get("/", getAllEmployes);
// Liste enrichie avec magasin + contrat (pour l'espace RH)
router.get("/details", getAllEmployesAvecDetails);
router.post("/", createEmploye);
router.get("/email/:email", getEmployeByEmail);
// Tous les employés d'un magasin (pour le responsable de magasin)
router.get("/magasin/:magasinId", getEmployesByMagasin);
router.post("/login", loginEmploye);
// Modifier un employé (affectation magasin, contrat, infos perso)
router.patch("/:id", updateEmploye);

export default router;
