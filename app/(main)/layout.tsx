import type {Metadata} from "next";
import Navbar from "@/components/NavBar";
import {Suspense} from "react";
import Loading from "@/app/(main)/loading";

export const metadata: Metadata = {
    title: "Quiz App : Dashboard",
    description: "A Quiz Management System",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Suspense fallback={<Loading />}>
                <Navbar />
                <div className="flex-1 flex flex-col">{children}</div>
            </Suspense>
        </div>
    );
}