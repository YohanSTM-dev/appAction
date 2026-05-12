import express from "express";
import { createMagasin, getAllMagasins } from "../controller/magasin.controller.js";

const router = express.Router();

router.get("/", getAllMagasins);
router.post("/", createMagasin);

export default router;
