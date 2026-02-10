import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const accessToken = (session as any).accessToken;

        const res = await fetch('http://localhost:5001/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
            return NextResponse.json(data);
        } else {
            return NextResponse.json(data, { status: res.status });
        }
    } catch (error: any) {
        console.error("Profile Update Proxy Error:", error);
        return NextResponse.json({ message: "Failed to sync with clinical vault." }, { status: 500 });
    }
}
