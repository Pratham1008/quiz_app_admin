import { NextRequest, NextResponse } from "next/server";
import {cookies} from "next/headers";

export async function POST(req: NextRequest) {

    (await cookies()).delete("role");
    (await cookies()).delete("name");
    req.cookies.clear();

    return NextResponse.json({ success: true });
}
