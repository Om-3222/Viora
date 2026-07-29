import { Router } from "express";
import protect from "../middleware/auth.middleware.js";

import {
    createMeeting,
    getMeeting,
} from "../controllers/meeting.controller.js";

const router = Router();

router.post("/", protect, createMeeting);

router.get("/:meetingCode", protect, getMeeting);

export default router;