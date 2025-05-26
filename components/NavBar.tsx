import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignOutButton from "@/components/signOutButton";

export default async function Navbar() {
    const role = (await cookies()).get("role")?.value;
    const name = (await cookies()).get("name")?.value;

    return (
        <nav className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
                <Link href="/home" className="text-xl font-semibold text-purple-700">
                    Quiz App
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-4 text-sm">
                    {(role === "INSTRUCTOR" || role === "STUDENT") && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="px-2 h-8">Quiz ▾</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {role === "INSTRUCTOR" && (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/quiz/create">Create Quiz</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/quiz/manage">Manage Quizzes</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/quiz/analytics">Quiz Analytics</Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {role === "STUDENT" && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/quiz/history">Quiz History</Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {role === "ADMIN" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="px-2 h-8">Users ▾</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/users/students">Students</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/users/instructors">Instructors</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}


                    <Link href="/settings">
                        <Button variant="ghost" className="px-2 h-8">Settings</Button>
                    </Link>

                    {/* Show username */}
                    <span className="text-gray-600 font-medium">{name}</span>

                    <SignOutButton />
                </div>
            </div>
        </nav>
    );
}
