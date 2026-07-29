import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinMeetingDialog() {
    const [meetingCode, setMeetingCode] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        const code = meetingCode.trim().toUpperCase();

        if (!code) return;

        navigate(`/meeting/${code}`);
    };

    return (
        <Dialog>
            <DialogTrigger render={<Button variant="outline">Join with Code</Button>} />

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join a meeting</DialogTitle>

                    <DialogDescription>
                        Enter the meeting code shared with you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <Input
                        placeholder="ABC-DEF-GHI"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleJoin();
                            }
                        }}
                    />

                    <Button
                        className="w-full"
                        onClick={handleJoin}
                    >
                        Join Meeting
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}