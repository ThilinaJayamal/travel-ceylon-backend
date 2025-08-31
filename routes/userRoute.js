import express from "express";
import { getMe, login, logout, register, updateUser } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(register);

router.route("/me")
    .get(auth, getMe)
    .put(auth, updateUser);

router.route("/logout").post(logout);
router.route("/login").post(login);

export default router;