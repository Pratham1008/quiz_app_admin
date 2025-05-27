import { NextRequest, NextResponse } from "next/server";
import {authFetch} from "@/lib/authFetch";

export async function GET(
    req: NextRequest,
    {params}: { params: Promise<{ resultId: string }> }
) {
    const resultId  = (await params).resultId;

    try {
        const res = await authFetch(`https://api.prathameshcorporation.info/admin/result/send?resultId=${resultId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ resultId }),
        });

        if (!res.ok) {
            throw new Error("Backend call failed");
        }

        return NextResponse.redirect("/home");
    } catch (err) {
        console.error("Error in API route:", err);
        return NextResponse.redirect("/home");
    }
}
