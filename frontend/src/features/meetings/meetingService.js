import api from "@/lib/axios";

export const createMeeting = async () => {
    const response = await api.post("/meetings");

    return response.data.meeting;
};

export const getMeeting = async (meetingCode) => {
    const response = await api.get(`/meetings/${meetingCode}`);

    return response.data.meeting;
};

export const getRecentMeetings = async () => {
    const response = await api.get("/meetings/recent");

    return response.data.meetings;
};