import { Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import JoinMeetingDialog from "./JoinMeetingDialog";
import { createMeetingThunk } from "@/features/meetings/meetingSlice";

export default function NewMeetingCard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading } = useSelector(
        (state) => state.meeting
    );

    const handleCreateMeeting = async () => {
        const result = await dispatch(createMeetingThunk());

        if (createMeetingThunk.fulfilled.match(result)) {
            navigate(`/meeting/${result.payload.meetingCode}`);
        }
    };

    return (
        <section className="rounded-3xl border bg-card px-10 py-16">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="mb-8 rounded-full bg-primary/10 p-6">
                    <Video className="h-12 w-12 text-primary" />
                </div>

                <h2 className="text-4xl font-bold tracking-tight">
                    Start a meeting
                </h2>

                <p className="mt-4 text-lg text-muted-foreground">
                    Create an instant meeting or join one using a meeting code.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={handleCreateMeeting}
                        disabled={isLoading}
                    >
                        <Plus className="mr-2 h-5 w-5" />

                        {isLoading
                            ? "Creating..."
                            : "New Meeting"}
                    </Button>

                    <JoinMeetingDialog />
                </div>
            </div>
        </section>
    );
}