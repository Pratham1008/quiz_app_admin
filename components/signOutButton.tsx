"use client";

import { Button } from "@/components/ui/button";
import { signOutUser } from "@/services/AuthService";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOutUser();
        await fetch("/api/logout", {
            method: "POST",
        });
        router.push("/");
    };

    return (
        <Button
            variant="outline"
            className="text-red-600 border-red-500 hover:bg-red-50"
            onClick={handleSignOut}
        >
            Sign Out
        </Button>
    );
}
