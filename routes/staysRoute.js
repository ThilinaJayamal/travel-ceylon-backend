import express from "express";
import { auth } from "../middleware/auth.js";
import { deleteRoom, registerStays, updateRoom, updateStay } from "../controllers/staysController.js";
import { addRoom } from "../controllers/staysController.js";

const router = express.Router();

router.route("/")
    .post(auth, registerStays)
    .put(auth,updateStay);

router.route("/:id/rooms").post(auth, addRoom);
router.route("/rooms/:staysId/:roomId").put(auth, updateRoom);
router.route("/rooms/:staysId/:roomId").delete(auth, deleteRoom);

export default router