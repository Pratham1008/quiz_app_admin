'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authFetch } from "@/lib/authFetch";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, Share2 } from 'lucide-react';

interface ResultResponse {
    name: string;
    quizName: string;
    totalQuestions: string;
    score: number;
    questions: string[];
    submittedAnswers: string[];
    correctAnswers: string[];
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function QuizResultPage() {
    const { sessionId } = useParams();
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid');

    const [result, setResult] = useState<ResultResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!uid || !sessionId || fetchedRef.current) return;

        const fetchResult = async () => {
            try {
                const response = await authFetch(
                    `https://api.prathameshcorporation.info/student/result/${sessionId}?uid=${uid}`
                );
                const data = await response.json();

                if (!data?.questions || !data.submittedAnswers || !data.correctAnswers) {
                    toast.error("Invalid result data received.");
                    return;
                }

                setResult(data);
                toast.success('Result fetched successfully!');
                fetchedRef.current = true;
            } catch (error) {
                console.error('Error fetching result:', error);
                toast.error("Failed to fetch result.");
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [uid, sessionId]);

    useEffect(() => {
        if (!result) return;

        const total = parseInt(result.totalQuestions);
        const maxMarks = total * 2;
        const percentage = (result.score / maxMarks) * 100;

        if (percentage >= 80) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
            });
        }
    }, [result]);

    if (loading) return <p className="text-center mt-10 text-muted">Loading result...</p>;
    if (!result) return <p className="text-center mt-10 text-muted">No result found.</p>;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Quiz Score',
                text: `I scored ${result.score} in ${result.quizName}!`,
                url: window.location.href
            });
        } else {
            toast.info("Sharing not supported on this browser.");
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-4xl mx-auto px-4 py-8"
        >
            <motion.h1
                className="text-4xl font-bold mb-6 text-center"
                variants={fadeInUp}
            >
                🎯 Quiz Results
            </motion.h1>

            <motion.div
                className="bg-white shadow-lg rounded-xl p-6 mb-6"
                variants={fadeInUp}
            >
                <p className="text-lg"><strong>Name:</strong> {result.name}</p>
                <p className="text-lg"><strong>Quiz:</strong> {result.quizName}</p>
                <p className="text-lg"><strong>Total Questions:</strong> {result.totalQuestions}</p>
                <p className="text-lg"><strong>Score:</strong> {result.score}</p>
                <p className="text-lg"><strong>Max Marks:</strong> {parseInt(result.totalQuestions) * 2}</p>
            </motion.div>

            <div className="space-y-6">
                {result.questions.map((question, index) => {
                    const userAnswer = result.submittedAnswers[index] || "Not Answered";
                    const correctAnswer = result.correctAnswers[index] || "N/A";
                    const isCorrect = userAnswer === correctAnswer;

                    return (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            className={`rounded-xl border p-5 shadow-sm ${
                                isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-base font-medium">
                                    {index + 1}. {question}
                                </p>
                                {isCorrect ? (
                                    <CheckCircle className="text-green-500 w-5 h-5" />
                                ) : (
                                    <XCircle className="text-red-500 w-5 h-5" />
                                )}
                            </div>
                            <p>
                                <span className="font-semibold">Your Answer:</span>{' '}
                                <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                    {userAnswer}
                                </span>
                            </p>
                            <p>
                                <span className="font-semibold">Correct Answer:</span>{' '}
                                <span className="text-gray-800">{correctAnswer}</span>
                            </p>
                        </motion.div>
                    );
                })}
                <motion.button
                    onClick={handleShare}
                    variants={fadeInUp}
                    className="flex items-center gap-2 mx-auto mb-10 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    <Share2 size={18} /> Share Result
                </motion.button>
            </div>
        </motion.div>
    );
}
