import { Suspense } from "react";
import QuizContent from "@/components/QuizContent";
import Loading from "@/app/(main)/loading";
import {cookies} from "next/headers";
import AdminContent from "@/components/adminContent";

export default async function QuizDashboard() {
    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;
    return (
        <div className="flex h-screen">
            <main className="flex-1 p-8 bg-gray-50 overflow-auto">
                <Suspense fallback={<Loading />}>
                    {role === "ADMIN" ? <AdminContent /> : <QuizContent />}
                </Suspense>
            </main>
        </div>
    );
}
