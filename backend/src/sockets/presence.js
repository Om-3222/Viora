import {
    addUser,
    removeUser,
    getOnlineUsers,
} from "./socketUtils.js";

export default function registerPresence(io, socket) {
    const { userId } = socket.handshake.auth;

    if (!userId) return;

    addUser(userId, socket.id);

    io.emit("online-users", getOnlineUsers());

    socket.on("disconnect", () => {
        removeUser(userId, socket.id);

        io.emit("online-users", getOnlineUsers());
    });
}