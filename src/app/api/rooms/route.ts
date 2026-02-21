import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";

export async function GET(request: Request) {
    const payload = getTokenFromRequest(request);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const rooms = await prisma.room.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { messages: true },
                },
            },
        });
        return NextResponse.json(rooms);
    } catch (error) {
        console.error("Fetch rooms error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const payload = getTokenFromRequest(request);
    if (!payload) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, description, password } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: "Room name is required" }, { status: 400 });
        }

        const existing = await prisma.room.findUnique({
            where: { name: name.trim() },
        });
        if (existing) {
            return NextResponse.json({ error: "Room name already exists" }, { status: 409 });
        }

        let passwordHash = null;
        if (password?.trim()) {
            passwordHash = await hashPassword(password);
        }

        const room = await prisma.room.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                passwordHash,
                createdBy: payload.userId,
            },
        });

        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error("Create room error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
