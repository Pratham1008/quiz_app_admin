'use client';

import { useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ResultInfo {
    sessionId: string;
    resultId: string;
    quizTitle: string;
    quizDescription: string;
    score: number;
    totalQuestions: string;
}

export default function QuizHistoryPage() {
    const uid = auth.currentUser?.uid;
    const [results, setResults] = useState<ResultInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!uid || fetchedRef.current) return;

        const fetchResults = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const response = await authFetch(`https://api.prathameshcorporation.info/student/results/${uid}`);
                const data = await response.json();

                if (!Array.isArray(data)) {
                    toast.error('Invalid response format');
                    return;
                }

                setResults(data);
                toast.success('Quiz history loaded');
                fetchedRef.current = true;
            } catch (error) {
                console.error('Error fetching results:', error);
                toast.error('Failed to load results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [uid]);

    const confirmDelete = (resultId: string) => {
        setDeleteId(resultId);
        setIsDialogOpen(true);
    };

    const handleEmailSent = async (resultId: string) => {
        try {
            const res = await authFetch(`https://api.prathameshcorporation.info/student/result/send?resultId=${resultId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Backend call failed");
            }

            toast.success("Email sent successfully!");
        } catch (err) {
            console.error("Error in API route:", err);
        }
    }

    const handleDeleteConfirmed = async () => {
        if (!deleteId) return;

        try {
            const res = await authFetch(`https://api.prathameshcorporation.info/student/result/delete/${deleteId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete result');
            }

            setResults((prev) => prev.filter((r) => r.resultId !== deleteId));
            toast.success('Result deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Could not delete result');
        } finally {
            setIsDialogOpen(false);
            setDeleteId(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10">
                <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">Loading Quiz History...</h1>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="p-5 border rounded-xl bg-white shadow-sm"
                        >
                            <Skeleton className="h-6 w-2/3 mb-3" />
                            <Skeleton className="h-4 w-full mb-4" />
                            <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-1/3 mb-4" />
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return <p className="text-center mt-10 text-gray-500">No quiz results found.</p>;
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-12">Quiz History</h1>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {results.map((result, index) => {
                    const total = parseInt(result.totalQuestions);
                    const maxMarks = total * 2;
                    const percentage = ((result.score / maxMarks) * 100).toFixed(1);
                    const performanceColor =
                        parseFloat(percentage) >= 80
                            ? 'text-green-600'
                            : parseFloat(percentage) >= 50
                                ? 'text-yellow-600'
                                : 'text-red-600';

                    return (
                        <motion.div
                            key={result.resultId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
                        >
                            <h2 className="text-lg font-medium text-gray-800 mb-1">{result.quizTitle}</h2>
                            <p className="text-sm text-gray-600 mb-4">{result.quizDescription}</p>

                            <div className="flex flex-wrap justify-between text-sm text-gray-700 mb-4">
                                <span>Score: {result.score}/{maxMarks}</span>
                                <span>Questions: {result.totalQuestions}</span>
                                <span className={`${performanceColor} font-medium`}>{percentage}%</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <Link
                                    href={`/quiz/result`}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    <Button variant="ghost" className="px-2 h-8" onClick={() => handleEmailSent(result.resultId)}>
                                        Get Detailed Result →
                                    </Button>
                                </Link>

                                <button
                                    onClick={() => confirmDelete(result.resultId)}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    Delete Result
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <>
                            <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this result? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteConfirmed}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
