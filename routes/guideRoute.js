import express from "express"
import { auth } from "../middleware/auth.js";
import { guideRegister, updateGuide } from "../controllers/guideController.js";

const router = express.Router();

router.route("/").post(auth, guideRegister);
router.route("/").put(auth, updateGuide);

export default router;