import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Meeting from "../models/meeting.model.js";

/*
meetingParticipants

Map {
    "ABC-DEF-GHI" => Map {
        userId => {
            socketId,
            name
        }
    }
}
*/

// Map {
//   "socketA" => "ABC-DEF-GHI",
//   "socketB" => "ABC-DEF-GHI",
//   "socketC" => "ABC-DEF-GHI"
// }

const meetingParticipants = new Map();

const socketMeetings = new Map();

export default function registerMeetingEvents(io, socket) {
    socket.on("meeting:join", async ({ meetingCode }) => {

        try {
            const userId = socket.handshake.auth.userId;

            const user = await User.findById(userId).select("name");

            if (!user) return;

            // Add the user to the meeting's participants array in the database
            await Meeting.updateOne(
                { meetingCode: meetingCode.toUpperCase() },
                { $addToSet: { participants: userId } }
            );

            // if meeting does not exist, create a new meeting map
            if (!meetingParticipants.has(meetingCode)) {
                meetingParticipants.set(meetingCode, new Map());
            }

            const participants = meetingParticipants.get(meetingCode);

            // Add participant to the meeting map
            participants.set(userId, {
                socketId: socket.id,
                name: user.name,
                mic: true,
                camera: true,
                screen: false,
            });

            // add to room
            socket.join(meetingCode);

            // Map socketId to meetingCode
            socketMeetings.set(socket.id, meetingCode);

            // send updated participants list to all in the room
            io.to(meetingCode).emit(
                "meeting:participants",
                [...participants.entries()].map(([userId, participant]) => ({
                    userId,
                    socketId: participant.socketId,
                    name: participant.name,
                    mic: participant.mic,
                    camera: participant.camera,
                    screen: participant.screen,
                }))
            );

            const previousMessages = await Message.aggregate([
                { $match: { meetingCode } },
                { $sort: { createdAt: -1 } }, // Get newest first
                { $limit: 100 },
                { $sort: { createdAt: 1 } }   // Re-sort the 100 results back to chronological order
            ]);

            socket.emit("meeting:chat-history", previousMessages);

            // if more than 1 participant, send ready event to new participant
            if (participants.size > 1) {
                // send to all in room except the sender (the new participant)
                // to create offer for each existing participant

                socket.to(meetingCode).emit("meeting:ready", {
                    joinedSocketId: socket.id,      // sender socket id
                });
            }

            console.log(`${user.name} joined ${meetingCode}`);
        } catch (error) {
            console.error("Meeting Join Error:", error);
        }
    });

    socket.on("webrtc:offer", ({ targetSocketId, offer }) => {
        io.to(targetSocketId).emit("webrtc:offer", {
            senderSocketId: socket.id,
            offer,
        })
    })

    socket.on("webrtc:answer", ({ targetSocketId, answer }) => {
        io.to(targetSocketId).emit("webrtc:answer", {
            senderSocketId: socket.id,
            answer,
        });
    })

    socket.on("webrtc:ice", ({ targetSocketId, candidate }) => {
        console.log("Forwarding ICE to: ", targetSocketId);

        io.to(targetSocketId).emit("webrtc:ice", {
            senderSocketId: socket.id,
            candidate,
        });
    })

    socket.on("disconnect", () => {
        const meetingCode = socketMeetings.get(socket.id);

        if (!meetingCode) return;

        const participants = meetingParticipants.get(meetingCode);

        if (!participants) return;

        let disconnectedParticipant = null;

        for (const [userId, participant] of participants.entries()) {
            if (participant.socketId === socket.id) {
                disconnectedParticipant = participant;
                participants.delete(userId);
                break;
            }
        }

        socketMeetings.delete(socket.id);

        if (disconnectedParticipant) {
            io.to(meetingCode).emit("meeting:participant-left", {
                socketId: disconnectedParticipant.socketId,
            });
        }

        io.to(meetingCode).emit(
            "meeting:participants",
            [...participants.entries()].map(([userId, participant]) => ({
                userId,
                socketId: participant.socketId,
                name: participant.name,
                mic: participant.mic,
                camera: participant.camera
            }))
        );

        if (participants.size === 0) {
            meetingParticipants.delete(meetingCode);
        }
    });

    socket.on("media:update", ({ mic, camera, screen }) => {
        const meetingCode = socketMeetings.get(socket.id);

        if (!meetingCode) return;

        const participants = meetingParticipants.get(meetingCode);

        if (!participants) return;

        for (const participant of participants.values()) {
            if (participant.socketId === socket.id) {
                participant.mic = mic;
                participant.camera = camera;
                participant.screen = screen;
                break;
            }
        }

        io.to(meetingCode).emit(
            "meeting:participants",
            [...participants.entries()].map(([userId, participant]) => ({
                userId,
                socketId: participant.socketId,
                name: participant.name,
                mic: participant.mic,
                camera: participant.camera,
                screen: participant.screen
            }))
        )

    });

    socket.on("meeting:chat", async ({ message, sender }) => {
        const meetingCode = socketMeetings.get(socket.id);

        if (!meetingCode || !message?.trim()) return;

        const savedMessage = await Message.create({
            meetingCode,
            sender,
            message: message.trim(),
        });

        io.to(meetingCode).emit("meeting:chat", savedMessage);
    });

    socket.on("meeting:chat:older", async ({ before }) => {
        const meetingCode = socketMeetings.get(socket.id);

        if (!meetingCode) return;

        const olderMessages = await Message.aggregate([
            {
                $match: {
                    meetingCode,
                    createdAt: { $lt: new Date(before) },
                },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 50 },
            { $sort: { createdAt: 1 } },
        ]);

        socket.emit("meeting:chat:older", olderMessages);
    });

}
