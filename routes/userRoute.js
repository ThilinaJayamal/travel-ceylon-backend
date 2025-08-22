import express from "express";
import { login, logout, register } from "../controllers/userController.js";

const router = express.Router();

router.route("/").post(register);
router.route("/logout").post(logout);
router.route("/login").post(login);

export default router;