import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
import { verifyToken } from "./lib/auth";
import { parse } from "cookie";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    // Socket.IO Authentication Middleware
    io.use((socket, next) => {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error("Authentication error: No cookies found"));
        }

        const cookies = parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error("Authentication error: Token not found"));
        }

        const payload = verifyToken(token);
        if (!payload) {
            return next(new Error("Authentication error: Invalid token"));
        }

        // Attach user info to socket
        (socket as any).user = payload;
        next();
    });

    io.on("connection", (socket) => {
        const user = (socket as any).user;
        console.log(`Client authenticated: ${user.username} (${socket.id})`);

        // Join a specific room
        socket.on("join_room", (roomId: string) => {
            // Leave previous rooms if any (except its own id room)
            socket.rooms.forEach((room) => {
                if (room !== socket.id) socket.leave(room);
            });

            socket.join(roomId);
            console.log(`User ${user.username} joined room: ${roomId}`);
        });

        // When a message is sent
        socket.on("send_message", async (data: { text: string; roomId: string }) => {
            try {
                const { text, roomId } = data;

                // Verify room exists (optional but good for safety)

                const savedMessage = await prisma.message.create({
                    data: {
                        text,
                        userId: user.userId,
                        roomId,
                    },
                    include: {
                        user: {
                            select: { username: true }
                        }
                    }
                });

                // Broadcast message ONLY to users in that room
                io.to(roomId).emit("receive_message", savedMessage);
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
