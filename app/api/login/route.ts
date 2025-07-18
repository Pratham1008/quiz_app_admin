import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { uid } = await req.json();

    const backendRes = await fetch(`https://api.prathameshcorporation.info/public/user/${uid}`);
    if (!backendRes.ok) {
        return NextResponse.json({ error: "User fetch failed" }, { status: 401 });
    }

    const user = await backendRes.json();

    (await cookies()).set("role", user.role, {
        maxAge: 3600 * 24 * 7,
        path: "/",
        sameSite: "strict",
        secure: true,
    });
    (await cookies()).set("name", user.name, {
        maxAge: 3600 * 24 * 7,
        path: "/",
        sameSite: "strict",
        secure: true,
    });

    return NextResponse.json({ success: true });
}
