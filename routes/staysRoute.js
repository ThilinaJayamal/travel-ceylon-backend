import express from "express";
import { auth } from "../middleware/auth.js";
import { registerStays } from "../controllers/staysController.js";

const router = express.Router();

router.route("/").post(auth, registerStays)

export default router