"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {authFetch} from "@/lib/authFetch";

interface StartQuizButtonProps {
    quizId: string;
}

export default function StartQuizButton({ quizId }: StartQuizButtonProps) {
    const router = useRouter();

    const startQuiz = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return alert("User ID not found!");

        const res = await authFetch(
            `https://api.prathameshcorporation.info/student/start?quizId=${quizId}&uid=${uid}`,
            {
                method: "POST",
            }
        );

        const data = await res.json();

        localStorage.setItem(
            `quiz-session-${quizId}`,
            data.sessionId
        );

        if (!res.ok) return alert("Failed to start quiz");

        router.push(`/quiz/${quizId}`);
    };

    return (
        <button
            onClick={startQuiz}
            className="text-sm font-medium text-blue-600 hover:underline"
        >
            Attempt
        </button>
    );
}
