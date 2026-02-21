import { NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
    const payload = getTokenFromRequest(request);
    if (!payload) {
        return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: payload });
}
