import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Loader2, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authFetch } from "@/lib/authFetch";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().trim().min(1, { message: "Name is required" }),
    email: z.string().trim().email({ message: "Invalid email" }).min(1),
    countryCode: z.string().trim().regex(/^\+\d{1,4}$/, { message: "Invalid country code" }),
    mobileNo: z.string().trim().regex(/^\d{6,15}$/, { message: "Invalid mobile number" }),
    password: z.string().trim().min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

const countryCodes = [
    { code: "+91", label: "🇮🇳 India" },
    { code: "+1", label: "🇺🇸 USA" },
    { code: "+44", label: "🇬🇧 UK" },
    { code: "+61", label: "🇦🇺 Australia" },
    { code: "+971", label: "🇦🇪 UAE" },
];

export default function AddInstructorDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            countryCode: "+91",
            mobileNo: "",
            password: "",
        },
    });

    const handleSubmit = async (values: FormData) => {
        try {
            setIsLoading(true);

            const fullPhone = `${values.countryCode} ${values.mobileNo}`;

            const instructor = {
                name: values.name,
                email: values.email,
                password: values.password,
                mobileNo: fullPhone,
                uid: "123",
            };

            const response = await authFetch("http://3.85.30.254:8080/admin/instructor/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(instructor),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error("Failed to register instructor.");
                throw new Error(data.message || "Failed to register instructor.");
            }

            toast.success("Instructor added successfully!");
            window.location.reload();
            setIsOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error adding instructor:", error);
            toast.error((error as Error).message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <PlusCircle size={18} />
                    Add Instructor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Instructor</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Instructor Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-2">
                            <FormField
                                control={form.control}
                                name="countryCode"
                                render={({ field }) => (
                                    <FormItem className="w-[110px]">
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="h-10 px-2 rounded-md border w-full bg-background text-sm"
                                            >
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
                                        <FormLabel>Mobile No</FormLabel>
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
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="animate-spin mr-2" size={18} />}
                            Add Instructor
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
