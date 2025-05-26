// app/quiz/loading.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="p-8 space-y-10">
            {/* Header Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </motion.div>

            {/* Table Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-4"
            >
                <Skeleton className="h-6 w-1/3" />
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        <tr>
                            {[...Array(7)].map((_, i) => (
                                <th key={i} className="p-2">
                                    <Skeleton className="h-4 w-24" />
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(5)].map((_, rowIdx) => (
                            <tr key={rowIdx}>
                                {[...Array(7)].map((_, colIdx) => (
                                    <td key={colIdx} className="p-2">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
