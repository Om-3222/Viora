import Meeting from "../models/meeting.model.js";
import generateMeetingCode from "../utils/generateMeetingCode.js";

export const createMeeting = async (req, res) => {
    try {
        let meetingCode;
        let exists = true;

        while (exists) {
            meetingCode = generateMeetingCode();

            exists = await Meeting.exists({
                meetingCode,
            });
        }

        const meeting = await Meeting.create({
            meetingCode,
            host: req.user._id,
        });

        res.status(201).json({
            meeting,
        });
    } catch (error) {
        console.error("Create Meeting Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getMeeting = async (req, res) => {
    try {
        const { meetingCode } = req.params;

        const meeting = await Meeting.findOne({
            meetingCode: meetingCode.toUpperCase(),
        }).populate("host", "name email avatar");

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found.",
            });
        }

        if (meeting.status === "ended") {
            return res.status(400).json({
                message: "This meeting has already ended.",
            });
        }

        res.status(200).json({
            meeting,
        });
    } catch (error) {
        console.error("Get Meeting Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getRecentMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({
            $or: [
                { host: req.user._id },
                { participants: req.user._id }
            ]
        })
        .populate("host", "name email avatar")
        .sort({ updatedAt: -1 })
        .limit(10);

        res.status(200).json({
            meetings,
        });
    } catch (error) {
        console.error("Get Recent Meetings Error:", error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};