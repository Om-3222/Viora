import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSelector } from "react-redux";

export default function Topbar() {
    const { user } = useSelector((state) => state.auth);

    return (
        <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
                <SidebarTrigger />

                <h1 className="text-xl font-semibold">
                    Dashboard
                </h1>
            </div>

            <div className="text-sm font-medium">
                Welcome, {user?.name}
            </div>
        </header>
    );
}