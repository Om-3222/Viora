import {
    createSlice,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import {
    createMeeting,
    getMeeting,
    getRecentMeetings,
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

export const fetchRecentMeetingsThunk = createAsyncThunk(
    "meeting/fetchRecent",
    async (_, thunkAPI) => {
        try {
            return await getRecentMeetings();
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch recent meetings."
            );
        }
    }
);

// participants = [
//     {
//         userId,
//         socketId,
//         name,
//         mic: true,
//         camera: true,
//     }
// ]

const initialState = {
    meeting: null,

    participants: [],

    recentMeetings: [],

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
            state.participants = action.payload.map((participant) => ({
                ...participant,
                mic: participant.mic ?? true,
                camera: participant.camera ?? true,
            }));
        },
        removeParticipant: (state, action) => {
            state.participants = state.participants.filter(
                (participant) => participant.socketId !== action.payload
            );
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
            })
            .addCase(fetchRecentMeetingsThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchRecentMeetingsThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.recentMeetings = action.payload;
            })
            .addCase(fetchRecentMeetingsThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearMeeting, setParticipants, removeParticipant
} = meetingSlice.actions;

export default meetingSlice.reducer;