import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = getTokenFromRequest(request);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const room = await prisma.room.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                passwordHash: true, // we use this to check IF it's protected
                createdAt: true,
            }
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...room,
            isProtected: !!room.passwordHash,
            passwordHash: undefined // mask the hash
        });
    } catch (error) {
        console.error("Fetch room info error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
