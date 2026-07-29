import User from "../models/user.model.js";

const meetingParticipants = new Map();

const socketMeetings = new Map();

export default function registerMeetingEvents(io, socket) {
    socket.on("meeting:join", async ({ meetingCode }) => {

        try {
            const userId = socket.handshake.auth.userId;

            const user = await User.findById(userId).select("name");

            if (!user) return;

            if (!meetingParticipants.has(meetingCode)) {
                meetingParticipants.set(meetingCode, new Map());
            }

            const participants = meetingParticipants.get(meetingCode);

            participants.set(userId, {
                socketId: socket.id,
                name: user.name,
            });

            socket.join(meetingCode);

            socketMeetings.set(socket.id, meetingCode);

            io.to(meetingCode).emit(
                "meeting:participants",
                [...participants.entries()].map(([userId, participant]) => ({
                    userId,
                    socketId: participant.socketId,
                    name: participant.name,
                }))
            );

            if (participants.size > 1) {
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
            }))
        );

        if (participants.size === 0) {
            meetingParticipants.delete(meetingCode);
        }
    });
}

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