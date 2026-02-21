import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = getTokenFromRequest(request);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;

    try {
        const messages = await prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: "asc" },
            include: {
                user: {
                    select: { username: true },
                },
            },
        });

        // Decrypt messages for the client
        const decryptedMessages = messages.map(msg => ({
            ...msg,
            text: decrypt(msg.text)
        }));

        return NextResponse.json(decryptedMessages);
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
