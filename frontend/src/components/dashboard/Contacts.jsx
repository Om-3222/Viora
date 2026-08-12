import { User } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "@/features/users/usersSlice";

export default function Contacts() {

    const dispatch = useDispatch();

    const {
        users,
        onlineUsers,
        selectedUser,
        isLoading,
        error,
    } = useSelector((state) => state.users);

    const onlineUserSet = useMemo(
        () => new Set(onlineUsers),
        [onlineUsers]
    );

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <p>Loading contacts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card">
            <div className="border-b p-4">
                <h2 className="text-lg font-semibold">
                    Contacts
                </h2>
            </div>

            <div className="divide-y overflow-y-auto h-[400px] no-scrollbar">
                {users.map((user) => {
                    const isOnline = onlineUserSet.has(user._id);

                    return (
                        <button
                            key={user._id}
                            onClick={() => dispatch(setSelectedUser(user))}
                            className={`flex w-full items-center gap-4 p-4 transition-colors ${selectedUser?._id === user._id ? "bg-primary/10" : "hover:bg-muted/50"
                                }`}
                        >
                            <div className="relative">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-6 w-6 text-primary" />
                                </div>

                                <span
                                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${isOnline
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                        }`}
                                />
                            </div>

                            <div className="flex-1 text-left">
                                <p className="font-medium">
                                    {user.name}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </button>
                    );
                })}

                {users.length === 0 && (
                    <div className="p-6 text-center text-muted-foreground">
                        No contacts found.
                    </div>
                )}
            </div>
        </div>
    );
}