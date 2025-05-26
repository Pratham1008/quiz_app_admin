"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { signInWithEmailPassword } from "@/services/AuthService";
import {useEffect, useState} from "react";
import {useAuth} from "@/context/AuthContext";

export default function Login() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/home");
        }
    }, [user, loading, router]);

    const formSchema = z.object({
        email: z.string().trim().email().min(1, {
            message: "Email is required",
        }),
        password: z.string().trim().min(1, {
            message: "Password is required",
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {

            const credentials = await signInWithEmailPassword(values.email, values.password);

            const uid = credentials.uid;

            const backendRes = await fetch("https://api.prathameshcorporation.info/public/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                }),
            });

            if (!backendRes.ok) {
                const errorData = await backendRes.json();
                throw new Error(errorData.error || "Backend login failed");
            }

            const backendData = await backendRes.json();

            await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid }),
            });

            localStorage.setItem("authToken", backendData.token);

            router.replace("/home");
            window.location.reload()
        } catch (error) {
            console.error("Login error:", error);
            alert((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loader className="animate-spin mr-2" />;
    return (
        <main className="w-full min-h-[590px] h-auto max-w-full pt-10">
            <div className="w-full h-full p-5 rounded-md">
                <Logo />

                <h1 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-1.5 mt-8 text-center sm:text-left">
                    Log in to Quiz App
                </h1>
                <p className="mb-8 text-center sm:text-left text-base dark:text-[#f1f7feb5] font-normal">
                    Don&#39;t have an account?{" "}
                    <Link className="text-primary" href="/signup">
                        Sign up
                    </Link>
                    .
                </p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="subscribeto@channel.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mb-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                            Password
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mb-4 flex w-full items-center justify-end">
                            <Link
                                className="text-sm dark:text-white"
                                href={`/forgot-password?email=${form.getValues().email}`}
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <Button
                            className="w-full text-[15px] h-[40px] !bg-blue-500 text-white font-semibold"
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting && <Loader className="animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </Form>
                <p className="text-xs dark:text-slate- font-normal mt-7">
                    By signing in, you agree to our{" "}
                    <a className="text-primary hover:underline" href="#">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a className="text-primary hover:underline" href="#">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </main>
    );
}
