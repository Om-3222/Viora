import {
    Home,
    Phone,
    Users,
    Clock,
    Settings,
    LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Calls",
        url: "/call",
        icon: Phone,
    },
    {
        title: "Meetings",
        url: "/meeting",
        icon: Users,
    },
    {
        title: "History",
        url: "/history",
        icon: Clock,
    },
];

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="p-6">
                <h1 className="text-2xl font-bold text-primary">
                    VIORA
                </h1>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                render={
                                    <NavLink to={item.url} />
                                }
                            >
                                <item.icon />
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}