import express from "express";
import { getMe, login, logout, register } from "../controllers/userController.js";
import {auth} from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(register);
router.route("/me").get(auth,getMe)
router.route("/logout").post(logout);
router.route("/login").post(login);

export default router;