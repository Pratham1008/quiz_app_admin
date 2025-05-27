'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function QuizSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        </motion.div>
    );
}
