import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Quiz App : Sign Up",
    description: "A Quiz Management System",
};

export default function AuthLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="w-full h-auto">
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-full max-w-[450px] mx-auto h-auto ">{children}</div>
            </div>
        </div>
    );
}