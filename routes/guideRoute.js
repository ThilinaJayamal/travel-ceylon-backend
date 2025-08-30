import express from "express"
import { auth } from "../middleware/auth.js";
import { getAllGuides, getGuideProfile, guideRegister, updateGuide } from "../controllers/guideController.js";

const router = express.Router();

router.route("/")
    .post(auth, guideRegister)
    .get(getAllGuides)
    .put(auth, updateGuide);

router.route("/profile").get(auth, getGuideProfile);

export default router;