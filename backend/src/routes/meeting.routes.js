import { Router } from "express";
import protect from "../middleware/auth.middleware.js";

import {
    createMeeting,
    getMeeting,
    getRecentMeetings,
} from "../controllers/meeting.controller.js";

const router = Router();

router.post("/", protect, createMeeting);

router.get("/recent", protect, getRecentMeetings);

router.get("/:meetingCode", protect, getMeeting);

export default router;