import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        meetingCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["waiting", "active", "ended"],
            default: "waiting",
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Meeting", meetingSchema);