import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/authSlice";
import themeReducer from "@/features/theme/themeSlice";
import usersReducer from "@/features/users/usersSlice";
import meetingReducer from "@/features/meetings/meetingSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        users: usersReducer,
        meeting: meetingReducer,
    },
});