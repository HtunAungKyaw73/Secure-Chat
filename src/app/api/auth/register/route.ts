import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        if (!username?.trim() || !email?.trim() || !password?.trim()) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            return NextResponse.json(
                { error: existing.email === email ? "Email already in use." : "Username already taken." },
                { status: 409 }
            );
        }

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { username: username.trim(), email: email.trim().toLowerCase(), passwordHash },
        });

        const token = signToken({ userId: user.id, username: user.username });

        const response = NextResponse.json(
            { user: { id: user.id, username: user.username, email: user.email } },
            { status: 201 }
        );
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
        return response;
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
