import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        hasUrl: !!process.env.DATABASE_URL,
        urlLength: process.env.DATABASE_URL?.length || 0,
        urlStart: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : "none",
        nodeEnv: process.env.NODE_ENV,
    });
}
