import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, comparePassword } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const payload = getTokenFromRequest(request);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { password } = await request.json();

    try {
        const room = await prisma.room.findUnique({
            where: { id },
        });

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (!room.passwordHash) {
            return NextResponse.json({ valid: true });
        }

        if (!password) {
            return NextResponse.json({ error: "Password required" }, { status: 400 });
        }

        const isValid = await comparePassword(password, room.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error("Verify room password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
