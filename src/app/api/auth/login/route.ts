import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email?.trim() || !password?.trim()) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });

        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const token = signToken({ userId: user.id, username: user.username });

        const response = NextResponse.json({
            user: { id: user.id, username: user.username, email: user.email },
        });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
