"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authFetch } from "@/lib/authFetch";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/firebase";
import { toast } from 'sonner';
import {useRouter} from "next/navigation";

interface QuestionResponse {
    questionId: string;
    question: string;
    options: string[];
}

export default function QuizAttemptContent({ quizId }: { quizId: string }) {
    const [questions, setQuestions] = useState<QuestionResponse[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        authFetch(`https://api.prathameshcorporation.info/student/questions/${quizId}`)
            .then(async (res) => {
                const text = await res.text();

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                try {
                    const data = JSON.parse(text);
                    setQuestions(data);
                } catch (err) {
                    console.error("JSON parse failed:", err);
                }
            })
            .catch((err) => {
                console.error("Fetch failed:", err);
            });

        const sessionId = localStorage.getItem(`quiz-session-${quizId}`);

        if (!sessionId) {
            alert("Session ID not found!");
            return;
        }

        authFetch(`https://api.prathameshcorporation.info/student/quiz/remaining-time/${sessionId}`)
            .then((res) => res.json())
            .then((data: { startTime: string; duration: number }) => {
                const start = new Date(data.startTime).getTime();
                const now = new Date().getTime();
                const elapsed = Math.floor((now - start) / 1000);
                const total = data.duration * 60;
                const remaining = total - elapsed;

                setDuration(total);
                setTimeLeft(remaining > 0 ? remaining : 0);
            })
            .catch(() => alert("Failed to fetch quiz timer"));
    }, [quizId]);

    const handleSubmit = useCallback(() => {
        setSubmitted(true);

        const sessionAnswers = questions.map((q) => answers[q.questionId] || "not answered");

        const sessionId = localStorage.getItem(`quiz-session-${quizId}`);

        if (!sessionId) {
            toast.error("Session ID not found!");
            return;
        }

        authFetch(`https://api.prathameshcorporation.info/student/quiz/submit/${sessionId}?uid=${auth.currentUser?.uid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionAnswers),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Submission failed");
                return res.json();
            })
            .then(() => {
                toast.success("Quiz submitted successfully!");
                router.push(`/quiz/result/${sessionId}?uid=${auth.currentUser?.uid}`);
            })
            .catch(() => {
                toast.error("Failed to submit quiz!");
            });
    }, [answers, questions, quizId, router]);

    useEffect(() => {
        if (timeLeft <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]);

    useEffect(() => {
        if (timeLeft === 0 && questions.length > 0 && !submitted) {
            handleSubmit();
        }
    }, [timeLeft, questions, submitted, handleSubmit]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const handleOptionChange = (questionId: string, selected: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selected }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const progressPercent = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

    return (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto md:p-10 font-sans">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-wide">Quiz Attempt</h1>
                <div className="bg-white border border-gray-300 rounded-lg px-5 py-2 font-mono text-lg text-gray-700 shadow-sm select-none">
                    Time Left: <span className="font-semibold">{formatTime(timeLeft)}</span>
                </div>
            </header>

            <Progress
                value={progressPercent}
                className="h-3 rounded-full bg-blue-100 mb-12"
                style={{ transition: "width 0.3s ease" }}
            />

            {questions.length > 0 ? (
                <main className="bg-white rounded-2xl shadow-md p-8 flex flex-col justify-between h-[480px]">
                    <section className="mb-10 overflow-auto">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                            Q{currentIndex + 1}. {questions[currentIndex].question}
                        </h2>

                        <RadioGroup
                            value={answers[questions[currentIndex].questionId] || ""}
                            onValueChange={(val) =>
                                handleOptionChange(questions[currentIndex].questionId, val)
                            }
                            className="space-y-5"
                        >
                            {questions[currentIndex].options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center space-x-4 cursor-pointer rounded-lg p-3 hover:bg-blue-50 transition"
                                >
                                    <RadioGroupItem
                                        value={opt}
                                        id={`${questions[currentIndex].questionId}-${idx}`}
                                        className="border-2 border-blue-400 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <label
                                        htmlFor={`${questions[currentIndex].questionId}-${idx}`}
                                        className="text-gray-800 text-lg select-none"
                                    >
                                        {opt}
                                    </label>
                                </div>
                            ))}
                        </RadioGroup>
                    </section>

                    <nav className="flex justify-between">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </Button>

                        {currentIndex < questions.length - 1 ? (
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                disabled={submitted}
                            >
                                Submit
                            </Button>
                        )}
                    </nav>
                </main>
            ) : (
                <p className="text-center text-gray-500 text-lg mt-20">Loading questions...</p>
            )}
        </div>
    );
}
