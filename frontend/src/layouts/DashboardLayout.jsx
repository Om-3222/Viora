import { Outlet } from "react-router-dom";

import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/AppSidebar";
import Topbar from "@/components/dashboard/Topbar";

export default function DashboardLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <main className="flex min-h-screen flex-1 flex-col">
                <Topbar />

                <div className="flex-1 p-6">
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
}