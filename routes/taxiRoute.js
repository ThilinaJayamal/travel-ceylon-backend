import express from "express"
import { auth } from "../middleware/auth.js";
import registerTaxi from "../controllers/TaxiController.js";

const router = express.Router();

router.route("/").post(auth, registerTaxi);

export default router;