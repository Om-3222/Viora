import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
    setUser,
    clearUser,
} from "./authSlice";

import { getCurrentUser } from "./authService";

export default function AuthProvider({ children }) {

    const dispatch = useDispatch();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getCurrentUser();

                dispatch(setUser(data.user));
            } catch {
                dispatch(clearUser());
            }
        };

        loadUser();
    }, [dispatch]);

    return children;
}