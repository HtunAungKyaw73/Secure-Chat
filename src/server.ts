import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // When a user joins
        socket.on("user_join", (username) => {
            console.log(`User ${username} joined`);
            socket.broadcast.emit("user_joined", username);
        });

        // When a message is sent
        socket.on("send_message", async (data) => {
            try {
                const savedMessage = await prisma.message.create({
                    data: {
                        text: data.text,
                        username: data.username,
                    },
                });
                // broadcast message to everyone (including sender, or sender can handle optimistic UI)
                io.emit("receive_message", savedMessage);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
