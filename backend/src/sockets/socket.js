import { Server } from "socket.io";
import registerPresence from "./presence.js";
import registerMeetingEvents from "./meeting.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:4173", "https://viora-1.vercel.app"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);

        registerPresence(io, socket);
        registerMeetingEvents(io, socket);
    });
};

export const getIO = () => io;