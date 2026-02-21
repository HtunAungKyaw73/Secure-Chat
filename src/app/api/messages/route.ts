import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const messages = await prisma.message.findMany({
            orderBy: { createdAt: "asc" },
            take: 100, // Fetch last 100 messages for MVP
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
