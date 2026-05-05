import express from "express";
import {
  createTypeContrat,
  getAllTypeContrat,
} from "../controller/typeContrat.controller.js";

const router = express.Router();

router.get("/", getAllTypeContrat);
router.post("/", createTypeContrat);

export default router;
