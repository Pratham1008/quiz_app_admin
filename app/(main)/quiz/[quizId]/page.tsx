import { Suspense } from "react";
import QuizAttemptContent from "@/components/quizAttemptContent";
import Loading from "@/app/(main)/loading";

export default async function QuizAttemptPage({params}: { params: Promise<{ quizId: string }> }) {
    return (
        <main className="max-w-4xl mx-auto min-h-screen">
            <Suspense fallback={<Loading />}>
                <QuizAttemptContent quizId={(await params).quizId} />
            </Suspense>
        </main>
    );
}
