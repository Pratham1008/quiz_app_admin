"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ConfirmationModal from "@/components/confirmationModal";
import { useRouter } from "next/navigation";
import {authFetch} from "@/lib/authFetch";

interface QuizDropdownProps {
    quizId: string;
}

export default function QuizDropdown({ quizId }: QuizDropdownProps) {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const res = await authFetch(`https://quiz-app-backend-cqqf.onrender.com/instructor/quiz/${quizId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                throw new Error("Failed to delete quiz");
            }

            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/quiz/edit/${quizId}`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowModal(true)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmationModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}
