import { UserRound } from "lucide-react";
import MeetingCodeDisplay from "./MeetingCodeDisplay";

export default function WaitingForParticipant({ meetingCode }) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-muted/20">

            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted animate-pulse">
                <UserRound size={50} />
            </div>

            <h2 className="mt-8 text-2xl font-semibold">
                Waiting for others...
            </h2>

            <p className="mt-2 text-muted-foreground">
                Share this meeting code
            </p>

            <MeetingCodeDisplay code={meetingCode} className="mt-6" />
        </div>
    );
}