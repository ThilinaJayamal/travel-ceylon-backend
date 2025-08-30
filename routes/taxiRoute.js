import express from "express"
import { auth } from "../middleware/auth.js";
import {registerTaxi, updateTaxi} from "../controllers/TaxiController.js";

const router = express.Router();

router.route("/").post(auth, registerTaxi);
router.route("/").put(auth, updateTaxi);

export default router;