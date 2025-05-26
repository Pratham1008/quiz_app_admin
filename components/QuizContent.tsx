import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import StartQuizButton from "@/components/startQuizButton";
import QuizDropdown from "@/components/dropDownActions";
import { cookies } from "next/headers";
import Link from "next/link";

interface Quiz {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    totalMarks: string;
    totalQuestions: string;
}

export default async function QuizContent() {
    const cookieStore = await cookies();
    const name = cookieStore.get("name")?.value;
    const role = cookieStore.get("role")?.value;

    const res = await fetch("https://quiz-app-backend-cqqf.onrender.com/public/allQuizzes", {
        next: { tags: ["quizzes"] },
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to fetch quizzes");

    const quizzes: Quiz[] = await res.json();

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Welcome, {name}</h2>
                    <p className="text-muted-foreground text-sm capitalize">{role?.toLowerCase()}</p>
                </div>
                {role === "INSTRUCTOR" && (
                    <Link
                        href="/quiz/add"
                        className="inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition"
                    >
                        Add Quiz
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card>
                    <CardHeader><CardTitle>Total Quizzes</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{quizzes.length}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Active Quizzes</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {quizzes.filter(q => new Date(q.endTime) > new Date()).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Users Attempted</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">4,239</p></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Quizzes</CardTitle>
                    <div className="text-sm text-muted-foreground">Overview of created quizzes</div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Quiz Title</th>
                                <th className="p-3">Total Questions</th>
                                <th className="p-3">Total Marks</th>
                                <th className="p-3">Start Time</th>
                                <th className="p-3">End Time</th>
                                <th className="p-3">Status</th>
                                {role === "STUDENT" && <th className="p-3">Action</th>}
                                {role === "INSTRUCTOR" && <th className="p-3">Manage</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {quizzes.map((quiz) => (
                                <tr key={quiz.id} className="border-b">
                                    <td className="p-3 font-medium text-gray-900">{quiz.title}</td>
                                    <td className="p-3">{quiz.totalQuestions}</td>
                                    <td className="p-3">{quiz.totalMarks}</td>
                                    <td className="p-3">{new Date(quiz.startTime).toLocaleString()}</td>
                                    <td className="p-3">{new Date(quiz.endTime).toLocaleString()}</td>
                                    <td className="p-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-semibold",
                                                new Date(quiz.endTime) > new Date() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {new Date(quiz.endTime) > new Date() ? "Active" : "Inactive"}
                                            </span>
                                    </td>
                                    {role === "STUDENT" && (
                                        <td className="p-3">
                                            <StartQuizButton quizId={quiz.id} />
                                        </td>
                                    )}
                                    {role === "INSTRUCTOR" && (
                                        <td className="p-3">
                                            <QuizDropdown quizId={quiz.id} />
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
