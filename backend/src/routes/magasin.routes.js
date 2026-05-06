import express from "express";
import { createMagasin, getAllMagasins } from "../controller/magasin.controller.js";

const router = express.Router();

router.get("/magasins", getAllMagasins);
router.post("/magasins", createMagasin);

export default router;
