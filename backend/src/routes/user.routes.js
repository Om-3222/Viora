import { Router } from "express";
import { getUsers, updateProfile } from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getUsers);
router.put("/profile", protect, updateProfile);

export default router;