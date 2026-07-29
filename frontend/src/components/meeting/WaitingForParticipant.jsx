import { UserRound } from "lucide-react";

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

            <div className="mt-6 rounded-lg border bg-background px-6 py-3 text-xl font-mono tracking-widest">
                {meetingCode}
            </div>
        </div>
    );
}