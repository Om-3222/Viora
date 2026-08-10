import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function MeetingCodeDisplay({ code, className = "" }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Meeting code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex items-stretch gap-2 ${className}`}>
            <div className="rounded-lg border bg-background px-6 py-3 text-xl font-mono tracking-widest flex items-center">
                {code}
            </div>
            <button
                onClick={handleCopy}
                className={`rounded-lg border px-4 transition duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer ${
                    copied
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-background hover:bg-muted text-foreground"
                }`}
                title="Copy Meeting Code"
            >
                {copied ? <Check size={20} className="animate-in fade-in zoom-in duration-200" /> : <Copy size={20} />}
            </button>
        </div>
    );
}
