"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AddInstructorDialog from "@/components/AddInstructorDialog";
import { authFetch } from "@/lib/authFetch";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
    name: string;
    email: string;
    role: string;
    img: string;
}

const roleColorMap: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-600",
    INSTRUCTOR: "bg-blue-100 text-blue-600",
    STUDENT: "bg-green-100 text-green-600",
};

export default function AdminContent() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dialogType, setDialogType] = useState<"delete" | "change-role-confirm" | "role-warning" | null>(null);
    const [newRole, setNewRole] = useState("");

    useEffect(() => {
        authFetch("https://api.prathameshcorporation.info/admin/users")
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load users!");
                setLoading(false);
            });
    }, []);

    const openChangeRoleDialog = (user: User) => {
        setSelectedUser(user);
        setDialogType("change-role-confirm");
    };

    const confirmRoleChange = () => {
        if (selectedUser && newRole) {
            if (["ADMIN", "INSTRUCTOR"].includes(newRole)) {
                setDialogType("role-warning");
            } else {
                handleRoleChange();
            }
        }
    };

    const handleRoleChange = () => {
        if (!selectedUser || !newRole) return;
        setUsers(prev => prev.map(u => u.email === selectedUser.email ? { ...u, role: newRole } : u));
        authFetch(`https://api.prathameshcorporation.info/admin/users?email=${selectedUser.email}&role=${newRole}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                toast.info(data.token, {
                    duration: 10000,
                    position: "top-right",
                    icon: "🎉",
                    className: "text-green-600",
                })
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to change the Role");
                setLoading(false);
            });
        setDialogType(null);
        setNewRole("");
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        setUsers(users.filter(u => u.email !== selectedUser.email));
        authFetch(`https://api.prathameshcorporation.info/admin/users?email=${selectedUser.email}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                toast.info(data.token, {
                    duration: 10000,
                    position: "top-right",
                    icon: "🎉",
                    className: "text-green-600",
                })
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to change the Role");
                setLoading(false);
            });
        setDialogType(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-6 py-8 max-w-6xl mx-auto space-y-6"
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
                <AddInstructorDialog />
            </div>

            <Card className="shadow-lg border">
                <CardHeader>
                    <CardTitle className="text-lg text-gray-700">Manage Users</CardTitle>
                </CardHeader>

                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-gray-600">
                        <tr>
                            <th className="p-3 text-left">User</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border-b"
                                >
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <Skeleton className="h-4 w-40" />
                                    </td>
                                    <td className="p-3">
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-4">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            users.map((user, index) => (
                                <motion.tr
                                    key={user.email}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="border-b hover:bg-muted/20"
                                >
                                    <td className="p-3 flex items-center gap-3 font-medium">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </td>
                                    <td className="p-3 text-gray-700">{user.email}</td>
                                    <td className="p-3">
                                        <Badge className={roleColorMap[user.role] || ""}>
                                            {user.role.toLowerCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-3 flex gap-4">
                                        <Button
                                            variant="link"
                                            className="text-blue-600 p-0 h-auto text-sm"
                                            onClick={() => openChangeRoleDialog(user)}
                                        >
                                            Change Role
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-red-600 p-0 h-auto text-sm"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDialogType("delete");
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Change Role Dialog */}
            <Dialog open={dialogType === "change-role-confirm"} onOpenChange={() => setDialogType(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogTitle className="text-blue-700">Change Role</DialogTitle>
                    <DialogDescription>
                        Select a new role for <strong>{selectedUser?.name}</strong>.
                    </DialogDescription>

                    <Select onValueChange={setNewRole} defaultValue="">
                        <SelectTrigger className="mt-4">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedUser?.role && (
                                <SelectItem value={selectedUser.role} disabled>
                                    Current: {selectedUser.role.charAt(0) + selectedUser.role.slice(1).toLowerCase()}
                                </SelectItem>
                            )}
                            {["STUDENT", "INSTRUCTOR", "ADMIN"]
                                .filter(role => role !== selectedUser?.role)
                                .map(role => (
                                    <SelectItem key={role} value={role}>
                                        {role.charAt(0) + role.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    <DialogFooter className="mt-4">
                        <Button
                            onClick={confirmRoleChange}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Confirm Role Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Warning Dialog */}
            <Dialog open={dialogType === "role-warning"} onOpenChange={() => setDialogType(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogTitle className="text-blue-700">Confirm Role Change</DialogTitle>
                    <DialogDescription className="text-sm text-gray-700">
                        You&#39;re assigning <strong>{newRole}</strong> role to <strong>{selectedUser?.name}</strong>.
                        <br />
                        {newRole === "ADMIN" ? (
                            <>They’ll gain full platform access including user management.</>
                        ) : (
                            <>They’ll be able to create quizzes and manage results.</>
                        )}
                        <br /> Are you sure?
                    </DialogDescription>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDialogType(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRoleChange} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={dialogType === "delete"} onOpenChange={() => setDialogType(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogTitle className="text-red-700">Delete User</DialogTitle>
                    <DialogDescription className="text-sm text-red-600">
                        Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
                    </DialogDescription>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDialogType(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
