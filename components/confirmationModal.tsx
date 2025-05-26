"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {motion} from "framer-motion";

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmationModal({ open, onClose, onConfirm }: ConfirmationModalProps) {
    useEffect(() => {
        if (open) {
            const audio = new Audio("/sounds/alert.mp3");
            audio.play().catch(console.error);

            if (typeof navigator.vibrate === "function") {
                navigator.vibrate(200);
            }
        }
    }, [open]);

    return (
        // <Dialog open={open} onOpenChange={onClose}>
        //     <DialogContent>
        //         <DialogHeader>
        //             <DialogTitle>Are you sure you want to delete this quiz?</DialogTitle>
        //         </DialogHeader>
        //         <div className="text-sm text-muted-foreground">
        //             This action cannot be undone.
        //         </div>
        //         <DialogFooter>
        //             <Button variant="outline" onClick={onClose}>Cancel</Button>
        //             <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
        //                 Confirm
        //             </Button>
        //         </DialogFooter>
        //     </DialogContent>
        // </Dialog>
        <Dialog open={open} onOpenChange={onClose}>
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
                                Are you sure you want to delete this quiz? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
