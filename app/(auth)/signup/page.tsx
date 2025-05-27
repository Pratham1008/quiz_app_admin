"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {  Loader, MailCheckIcon } from "lucide-react";
import Logo from "@/components/logo";
import {  signUpWithEmailPassword } from "@/services/AuthService";
import { useRouter } from "next/navigation";
import firebase from "firebase/compat/app";
import {useAuth} from "@/context/AuthContext";

export default function SignUp() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/home");
        }
    }, [user, loading, router]);

    const formSchema = z.object({
        name: z.string().trim().min(1, { message: "Name is required" }),
        email: z.string().trim().email({ message: "Invalid email" }).min(1),
        countryCode: z.string().trim().regex(/^\+\d{1,4}$/, { message: "Invalid country code" }),
        mobileNo: z.string().trim().regex(/^\d{6,15}$/, { message: "Invalid mobile number" }),
        password: z.string().trim().min(6, { message: "Password must be at least 6 characters" }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            countryCode: "+91",
            mobileNo: "",
            password: "",
        },
    });

    const countryCodes = [
        { code: "+91", label: "🇮🇳 India" },
        { code: "+1", label: "🇺🇸 USA" },
        { code: "+44", label: "🇬🇧 UK" },
        { code: "+61", label: "🇦🇺 Australia" },
        { code: "+971", label: "🇦🇪 UAE" },
    ];

    const registerUserOnBackend = async (user: {
        name: string;
        email: string;
        password: string;
        mobileNo: string;
        uid: string | undefined;
    }, uid: string) => {
        try {
            const response = await fetch("https://api.prathameshcorporation.info/public/student/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            const data = await response.json();
            if (response.ok) {
                console.log("User registered on backend:", data);
                await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid }),
                });
                setIsSubmitted(true);
                window.location.reload();
            } else {
                console.error("Backend registration error:", data);
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while registering on the backend.");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const fullPhone = `${values.countryCode} ${values.mobileNo}`;
            const userCredential = await signUpWithEmailPassword(values.email, values.password);

            const uid = userCredential.uid;

            const userData = {
                name: values.name,
                email: values.email,
                password: values.password,
                mobileNo: fullPhone,
                uid: userCredential?.uid,
            };
            await registerUserOnBackend(userData,uid);

        } catch (error) {
            console.error("Firebase error:", error);
            alert((error as Error).message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isSubmitted) {
            interval = setInterval(async () => {
                const verified = await checkEmail();
                if (verified) {
                    clearInterval(interval);
                    setIsSubmitted(false);
                    router.replace("/");
                }
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [isSubmitted, router]);

    const checkEmail = async () => {
        const user = firebase.auth().currentUser;
        if (!user) return false;
        await user.reload();
        return user.emailVerified;
    };

    if (loading) return <Loader className="animate-spin mr-2" />;
    return (
        <main className="w-full min-h-[590px] h-auto max-w-full pt-10">
            {!isSubmitted ? (
                <div className="w-full p-5 rounded-md">
                    <Logo />
                    <h1 className="text-xl font-bold mt-8 mb-1.5 text-center sm:text-left dark:text-[#fcfdffef]">
                        Create Student Account
                    </h1>
                    <p className="mb-6 text-base text-center sm:text-left dark:text-[#f1f7feb5]">
                        Already have an account?{" "}
                        <Link href="/" className="text-primary">Sign in</Link>.
                    </p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="example@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-2 mb-4">
                                <FormField
                                    control={form.control}
                                    name="countryCode"
                                    render={({ field }) => (
                                        <FormItem className="w-[120px]">
                                            <FormLabel>Code</FormLabel>
                                            <FormControl>
                                                <select {...field} className="h-10 px-2 rounded-md border w-full bg-background text-sm">
                                                    {countryCodes.map((c) => (
                                                        <option key={c.code} value={c.code}>
                                                            {c.label} {c.code}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mobileNo"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Mobile Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="w-full text-[15px] h-[40px] !bg-blue-500 text-white font-semibold"
                                disabled={isLoading}
                                type="submit"
                            >
                                {isLoading && <Loader className="animate-spin mr-2" />}
                                Create account
                            </Button>
                        </form>
                    </Form>
                    <p className="text-xs font-normal mt-4">
                        By signing up, you agree to our{" "}
                        <a className="text-primary hover:underline" href="#">Terms of Service</a>{" "}
                        and{" "}
                        <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
                    </p>
                </div>
            ) : (
                <div className="w-full h-[80vh] flex flex-col gap-2 items-center justify-center rounded-md">
                    <MailCheckIcon size="48px" className="animate-bounce" />
                    <h2 className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold">
                        Check your email
                    </h2>
                    <p className="mb-2 text-center text-sm text-muted-foreground dark:text-[#f1f7feb5] font-normal">
                        We just sent a verification link to {form.getValues().email}.
                    </p>
                </div>
            )}
        </main>
    );
}
