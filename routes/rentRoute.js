import express from "express";
import { auth } from "../middleware/auth.js";
import { addVehicle, deleteVehicle, getAllRents, getRentProfile, rentRegister, updateRent, updateVehicle } from "../controllers/rentController.js";


const router = express.Router();

router.route("/")
    .post(auth, rentRegister)
    .put(auth, updateRent)
    .get(getAllRents);

router.route("/profile").get(auth, getRentProfile)

router.route("/vehicle").post(auth, addVehicle)
router.route("/vehicle/:vehicleId").put(auth, updateVehicle)
router.route("/vehicle/:vehicleId").delete(auth, deleteVehicle)

export default router