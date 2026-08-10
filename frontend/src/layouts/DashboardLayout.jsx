import { Outlet, useLocation } from "react-router-dom";

import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout() {
    const location = useLocation();
    const isMeetingPage = location.pathname.startsWith("/meeting/");

    if (isMeetingPage) {
        return (
            <main className="flex h-screen w-screen flex-col bg-background overflow-hidden">
                <Outlet />
            </main>
        );
    }

    return (
        <div className="flex h-screen w-screen flex-col bg-background overflow-hidden">
            <Topbar />

            <main className="flex-1 p-6 min-h-0 overflow-y-auto no-scrollbar">
                <Outlet />
            </main>
        </div>
    );
}