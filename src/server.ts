import "dotenv/config";
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

// Track users in rooms: roomId -> Map<socketId, {username, userId}>
const roomMembers = new Map<string, Map<string, { username: string; userId: string }>>();

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);

    io.use((socket, next) => {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) return next(new Error("Authentication error"));

        const cookies = parse(cookieHeader);
        const token = cookies.token;
        if (!token) return next(new Error("Authentication error"));

        const payload = verifyToken(token);
        if (!payload) return next(new Error("Authentication error"));

        (socket as any).user = payload;
        next();
    });

    io.on("connection", (socket) => {
        const user = (socket as any).user;

        socket.on("join_room", (roomId: string) => {
            // Leave previous rooms
            socket.rooms.forEach((r) => {
                if (r !== socket.id) {
                    socket.leave(r);
                    handleRoomLeave(r, socket.id);
                }
            });

            socket.join(roomId);

            // Add to member tracking
            if (!roomMembers.has(roomId)) roomMembers.set(roomId, new Map());
            roomMembers.get(roomId)!.set(socket.id, { username: user.username, userId: user.userId });

            // Broadcast updated member list
            broadcastMembers(roomId);
        });

        socket.on("send_message", async (data: { text: string; roomId: string }) => {
            try {
                const { text, roomId } = data;
                const savedMessage = await prisma.message.create({
                    data: { text, userId: user.userId, roomId },
                    include: { user: { select: { username: true } } }
                });
                io.to(roomId).emit("receive_message", savedMessage);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on("disconnecting", () => {
            socket.rooms.forEach((r) => {
                if (r !== socket.id) handleRoomLeave(r, socket.id);
            });
        });

        function handleRoomLeave(roomId: string, socketId: string) {
            const members = roomMembers.get(roomId);
            if (members) {
                members.delete(socketId);
                if (members.size === 0) roomMembers.delete(roomId);
                else broadcastMembers(roomId);
            }
        }

        function broadcastMembers(roomId: string) {
            const members = roomMembers.get(roomId);
            if (members) {
                const memberList = Array.from(members.values());
                // Get unique users by userId (one user might have multiple tabs)
                const uniqueMembers = Array.from(
                    new Map(memberList.map(m => [m.userId, m])).values()
                );
                io.to(roomId).emit("room_members", uniqueMembers);
            }
        }
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
