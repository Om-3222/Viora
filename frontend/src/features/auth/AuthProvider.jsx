import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
    setUser,
    clearUser,
} from "./authSlice";

import { getCurrentUser } from "./authService";
import socket from "@/lib/socket";
import { setOnlineUsers } from "@/features/users/usersSlice";

export default function AuthProvider({ children }) {

    const dispatch = useDispatch();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getCurrentUser();

                dispatch(setUser(data.user));
                socket.auth = {
                    userId: data.user._id,
                };

                if (!socket.connected) {
                    socket.connect();
                }

                socket.off("online-users");

                socket.on("online-users", (users) => {
                    dispatch(setOnlineUsers(users));
                });

            } catch {
                dispatch(clearUser());
                socket.disconnect();
            }
        };

        loadUser();
        return () => {
            socket.off("online-users");
            socket.off("new-message");
        };
    }, [dispatch]);

    return children;
}