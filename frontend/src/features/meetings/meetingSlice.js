import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import {
    createMeeting,
    getMeeting,
} from "./meetingService";

export const createMeetingThunk = createAsyncThunk(
    "meeting/create",
    async (_, thunkAPI) => {
        try {
            return await createMeeting();
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                "Failed to create meeting."
            );
        }
    }
);

export const fetchMeetingThunk = createAsyncThunk(
    "meeting/fetch",
    async (meetingCode, thunkAPI) => {
        try {
            return await getMeeting(meetingCode);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                "Meeting not found."
            );
        }
    }
);

const initialState = {
    meeting: null,

    participants: [],

    isLoading: false,

    error: null,
};

const meetingSlice = createSlice({
    name: "meeting",

    initialState,

    reducers: {
        clearMeeting: (state) => {
            state.meeting = null;
            state.error = null;
            state.participants = [];
        },

        setParticipants: (state, action) => {
            state.participants = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(createMeetingThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(createMeetingThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.meeting = action.payload;
            })

            .addCase(createMeetingThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchMeetingThunk.pending, (state) => {
                state.isLoading = true;
            })

            .addCase(fetchMeetingThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.meeting = action.payload;
            })

            .addCase(fetchMeetingThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearMeeting, setParticipants
} = meetingSlice.actions;

export default meetingSlice.reducer;