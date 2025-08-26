import express from "express";
import { auth } from "../middleware/auth.js";
import { rentRegister } from "../controllers/rentController.js";


const router = express.Router();

router.route("/").post(auth, rentRegister)

export default router