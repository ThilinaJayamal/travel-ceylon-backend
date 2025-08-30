import express from "express"
import { auth } from "../middleware/auth.js";
import { getAllGuides, getGuideProfile, getGuideProfilePublic, guideRegister, updateGuide } from "../controllers/guideController.js";

const router = express.Router();

router.route("/")
    .post(auth, guideRegister)
    .get(getAllGuides)
    .put(auth, updateGuide);

router.route("/public").get(getGuideProfilePublic)

router.route("/profile").get(auth, getGuideProfile);

export default router;