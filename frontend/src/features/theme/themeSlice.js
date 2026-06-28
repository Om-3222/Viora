import { createSlice } from "@reduxjs/toolkit";

const initialTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

const initialState = {
    theme: initialTheme,
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme(state) {
            state.theme = state.theme === "dark" ? "light" : "dark";
            localStorage.setItem("theme", state.theme);
        },
    },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;