import { useState, useEffect } from "react";
import { Video, Clock, Copy, Check, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecentMeetingsThunk } from "@/features/meetings/meetingSlice";
import { Button } from "@/components/ui/button";

export default function RecentMeetings() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Select recent meetings and loading status from Redux store
    const { recentMeetings, isLoading } = useSelector((state) => state.meeting);
    const [copiedCode, setCopiedCode] = useState(null);

    // Fetch recent meetings on component mount
    useEffect(() => {
        dispatch(fetchRecentMeetingsThunk());
    }, [dispatch]);

    // Format ISO timestamp to relative readable text
    const getRelativeTime = (isoString) => {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return "Yesterday";
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch (e) {
            console.error("Error while getting relative time: ", e);
            return "Unknown";
        }
    };

    // Handle copying meeting code to clipboard
    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Rejoin the selected meeting
    const handleRejoin = (meetingCode) => {
        const code = meetingCode.trim().toUpperCase();
        if (code) {
            navigate(`/meeting/${code}`);
        }
    };

    return (
        <div className="rounded-xl border bg-card flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Meetings</h2>
            </div>

            {/* List of recent meetings */}
            <div className="divide-y overflow-y-auto h-[400px] no-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                        Loading meetings...
                    </div>
                ) : (
                    recentMeetings.map((meeting) => (
                        <div
                            key={meeting._id}
                            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                        >
                            {/* Meeting details */}
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                    <Video className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="font-medium text-base text-foreground leading-snug">
                                        {meeting.host?.name || "Group Meeting"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[14px] tracking-tight">
                                            {meeting.meetingCode}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {getRelativeTime(meeting.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => handleCopy(meeting.meetingCode)}
                                    title="Copy Code"
                                >
                                    {copiedCode === meeting.meetingCode ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 px-3 text-xs flex items-center gap-1.5"
                                    onClick={() => handleRejoin(meeting.meetingCode)}
                                >
                                    <PhoneCall className="h-3 w-3" />
                                    Rejoin
                                </Button>
                            </div>
                        </div>
                    ))
                )}

                {/* Empty State */}
                {!isLoading && recentMeetings.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground h-full min-h-[200px]">
                        <Clock className="h-8 w-8 mb-2 text-muted-foreground/60" />
                        <p className="text-sm">No recent meetings found</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Meetings you host or join will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
