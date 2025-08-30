import express from "express"
import { auth } from "../middleware/auth.js";
import {getAllTaxi, getTaxiProfile, registerTaxi, updateTaxi} from "../controllers/TaxiController.js";

const router = express.Router();

router.route("/")
    .post(auth, registerTaxi)
    .put(auth, updateTaxi)
    .get(getAllTaxi);

router.route("/profile").get(auth,getTaxiProfile);

export default router;