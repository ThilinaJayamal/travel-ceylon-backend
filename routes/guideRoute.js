import express from "express"
import { auth } from "../middleware/auth.js";
import { guideRegister } from "../controllers/guideController.js";

const router = express.Router();

router.route("/").post(auth, guideRegister);

export default router;