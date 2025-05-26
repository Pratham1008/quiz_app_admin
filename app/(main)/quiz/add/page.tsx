"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authFetch } from "@/lib/authFetch";
import { useRouter } from "next/navigation";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { JSONEditor } from "@/components/jsonEditor";
import { auth } from "@/lib/firebase";

const questionSchema = z.object({
    question: z.string().min(5),
    correctAnswer: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
});

const quizSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    totalQuestions: z.string().min(1),
    totalMarks: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    questions: z.array(questionSchema).min(1),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function AddQuizPage() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [jsonValue, setJsonValue] = useState("");

    useEffect(() => {
        const match = document.cookie.match(/role=(ADMIN|INSTRUCTOR|STUDENT)/);
        if (match) setRole(match[1]);
    }, []);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<QuizFormValues>({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: "",
            description: "",
            totalQuestions: "1",
            totalMarks: "",
            startTime: "",
            endTime: "",
            questions: [{ question: "", correctAnswer: "", options: ["", ""] }],
        },
    });

    const totalQuestions = useWatch({ control, name: "totalQuestions" });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions",
    });

    // ✅ Fix: Use `watch` instead of `control.watch`
    useEffect(() => {
        const subscription = watch((value) => {
            try {
                const parsed = quizSchema.parse(value);
                setJsonValue(JSON.stringify(parsed, null, 2));
            } catch {
                // do nothing if invalid
            }
        });

        return () => subscription.unsubscribe?.();
    }, [watch]);

    // Dynamic question count
    useEffect(() => {
        const count = parseInt(totalQuestions || "0");
        if (isNaN(count) || count <= 0) return;

        const current = fields.length;
        if (count > current) {
            for (let i = current; i < count; i++) {
                append({ question: "", correctAnswer: "", options: ["", ""] });
            }
        } else if (count < current) {
            for (let i = current - 1; i >= count; i--) {
                if (i >= count) remove(i);
            }
        }
    }, [append, fields.length, remove, totalQuestions]);

    const onSubmit = async (data: QuizFormValues) => {
        try {
            const uid = auth.currentUser?.uid;
            const response = await authFetch(`http://3.85.30.254:8080/instructor/addQuiz/${uid}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                toast.success("Quiz added successfully!");
                router.push("/home");
            } else {
                toast.error("Failed to add quiz.");
            }
        } catch {
            toast.error("Something went wrong.");
        }
    };

    const onSubmitJson = async () => {
        try {
            const uid = auth.currentUser?.uid;
            const parsed = JSON.parse(jsonValue);
            const parsedResult = quizSchema.safeParse(parsed);
            if (!parsedResult.success) {
                toast.error("Invalid quiz JSON");
                return;
            }

            const response = await authFetch(`https://simply-wise-firefly.ngrok-free.app/instructor/addQuiz/${uid}`, {
                method: "POST",
                body: JSON.stringify(parsed),
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                toast.success("Quiz added via JSON!");
                router.push("/home");
            } else {
                toast.error("Failed to add quiz.");
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                toast.error(`Invalid JSON format: ${e.message}`);
            }
        }
    };

    const handleJsonChange = (newJson: string) => {
        setJsonValue(newJson);
        try {
            const parsed = JSON.parse(newJson);
            const result = quizSchema.safeParse(parsed);
            if (result.success) {
                reset(parsed);
            }
        } catch {
            // skip invalid
        }
    };

    if (role === null) return null;

    if (role !== "INSTRUCTOR") {
        return (
            <div className="flex h-[70vh] items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl text-red-600 font-semibold"
                >
                    ❌ You are not authorized to access this page.
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto px-6 py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Tabs defaultValue="form" className="w-full min-h-[600px] flex flex-col">
                <TabsList className="mb-6">
                    <TabsTrigger value="form">📝 Form Mode</TabsTrigger>
                    <TabsTrigger value="json">💻 JSON Mode</TabsTrigger>
                </TabsList>

                {/* FORM MODE */}
                <TabsContent value="form">
                    <Card className="border shadow-md w-full h-full">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold">Add New Quiz</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Quiz Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Title</Label>
                                        <Input {...register("title")} />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                    </div>
                                    <div>
                                        <Label>Total Questions</Label>
                                        <Input type="number" {...register("totalQuestions")} />
                                    </div>
                                    <div>
                                        <Label>Total Marks</Label>
                                        <Input type="number" {...register("totalMarks")} />
                                    </div>
                                    <div>
                                        <Label>Start Time</Label>
                                        <Input type="datetime-local" {...register("startTime")} />
                                    </div>
                                    <div>
                                        <Label>End Time</Label>
                                        <Input type="datetime-local" {...register("endTime")} />
                                    </div>
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea rows={4} {...register("description")} />
                                </div>

                                <Separator className="my-6" />

                                {/* Questions */}
                                <div>
                                    <h3 className="text-2xl font-semibold mb-4">📚 Questions</h3>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {fields.map((field, index) => (
                                            <motion.div
                                                key={field.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="rounded-md border bg-muted/30 p-4 shadow-md"
                                            >
                                                <h4 className="font-semibold mb-2">Question {index + 1}</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label>Question</Label>
                                                        <Textarea {...register(`questions.${index}.question`)} />
                                                    </div>
                                                    <div>
                                                        <Label>Correct Answer</Label>
                                                        <Input {...register(`questions.${index}.correctAnswer`)} />
                                                    </div>
                                                    <div>
                                                        <Label>Options</Label>
                                                        {Array(4)
                                                            .fill(0)
                                                            .map((_, i) => (
                                                                <Input
                                                                    key={i}
                                                                    {...register(`questions.${index}.options.${i}`)}
                                                                    placeholder={`Option ${i + 1}`}
                                                                />
                                                            ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 text-right">
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "🚀 Submit Quiz"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* JSON MODE */}
                <TabsContent value="json" className="flex-grow">
                    <Card className="border shadow-md min-h-[600px] min-w-[800px] w-full">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Live JSON Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 flex flex-col h-full">
                            <JSONEditor value={jsonValue} onChange={handleJsonChange} />
                            <div className="text-right pt-4">
                                <Button
                                    onClick={onSubmitJson}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    🚀 Submit JSON
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
