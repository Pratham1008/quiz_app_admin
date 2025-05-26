import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { uid } = await req.json();

    const backendRes = await fetch(`https://quiz-app-backend-cqqf.onrender.com/public/user/${uid}`);
    if (!backendRes.ok) {
        return NextResponse.json({ error: "User fetch failed" }, { status: 401 });
    }

    const user = await backendRes.json();

    (await cookies()).set("role", user.role);
    (await cookies()).set("name", user.name);

    (await cookies()).delete("authToken");

    return NextResponse.json({ success: true });
}
