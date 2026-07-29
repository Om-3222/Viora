import { Button } from "@/components/ui/button";
import VideoTile from "./VideoTile";

export default function WaitingRoom({ meeting, localStream, onJoin }) {

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-5xl rounded-3xl border bg-card p-10">
                <div className="grid gap-10 lg:grid-cols-2">

                    <VideoTile
                        stream={localStream}
                        muted
                        name="You"
                    />

                    <div className="flex flex-col justify-center">

                        <h1 className="text-4xl font-bold">
                            Ready to join?
                        </h1>

                        <p className="mt-4 text-muted-foreground">
                            Meeting Code
                        </p>

                        <div className="mt-2 rounded-xl border p-4 text-xl font-semibold">
                            {meeting.meetingCode}
                        </div>

                        <Button
                            size="lg"
                            className="mt-8"
                            onClick={onJoin}
                        >
                            Join Meeting
                        </Button>

                    </div>

                </div>
            </div>
        </div>
    );
}