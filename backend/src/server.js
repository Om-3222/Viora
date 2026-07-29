import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { initializeSocket } from "./sockets/socket.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
};

startServer();