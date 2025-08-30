import express from "express"
import { auth } from "../middleware/auth.js";
import { getAllGuides, guideRegister, updateGuide } from "../controllers/guideController.js";

const router = express.Router();

router.route("/").post(auth, guideRegister).get(getAllGuides);
router.route("/").put(auth, updateGuide);

export default router;