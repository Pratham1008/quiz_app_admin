import { NextRequest, NextResponse } from "next/server";
import { toast } from 'sonner';

export async function GET(req: NextRequest, { params }: { params: { resultId: string } }) {
    const resultId = params.resultId;

    try {
        const res = await fetch(`https://api.prathameshcorporation.info/admin/result/send?resultId=${resultId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ resultId }),
        });

        if (!res.ok) {
            throw new Error("Backend call failed");
        }

        toast.success("Email sent successfully!");
        return NextResponse.redirect(new URL(req.url));
    } catch (err) {
        console.error("Error in API route:", err);
        return NextResponse.redirect(new URL(req.url));
    }
}
