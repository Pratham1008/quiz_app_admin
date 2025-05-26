import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification, signOut,
} from "firebase/auth";
import {auth} from "@/lib/firebase";

export const signOutUser = async () => {
    await signOut(auth);
    localStorage.clear();
};

export const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await sendEmailVerification(userCredential.user);
        }

        return userCredential.user;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Something went wrong. Please try again.");
    }
};

export const signInWithEmailPassword = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("Something went wrong. Please try again.");
    }
};