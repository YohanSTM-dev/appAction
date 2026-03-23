import express from "express";
import {
	createEmploye,
	getAllEmployes,
	getEmployeByEmail,
	loginEmploye,
} from "../controller/employe.controller.js";

const router = express.Router();

router.get("/", getAllEmployes);
router.post("/", createEmploye);
router.get("/email/:email", getEmployeByEmail);
router.post("/login", loginEmploye);


export default router;
