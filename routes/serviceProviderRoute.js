import express from "express";
import { login, logout, register } from "../controllers/serviceProviderController.js";

const router = express.Router();

router.route("/").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router