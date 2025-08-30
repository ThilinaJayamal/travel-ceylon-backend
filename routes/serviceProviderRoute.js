import express from "express";
import { login, logout, register, updateServiceProvider } from "../controllers/serviceProviderController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(register);
router.route("/").put(auth, updateServiceProvider);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router