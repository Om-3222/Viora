import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Topbar() {
    const { user } = useSelector((state) => state.auth);

    return (
        <header className="flex h-16 items-center justify-between border-b px-6">
            <div className="flex items-center gap-3">
                <Link
                    to="/"
                    className="text-xl font-bold tracking-wider text-primary"
                >
                    VIORA
                </Link>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium">
                {/* Hover Dropdown for User Profile */}
                <div className="group relative py-2">
                    <span className="cursor-pointer hover:text-primary transition-colors select-none">
                        Welcome, {user?.name}
                    </span>

                    <div className="absolute right-0 top-full pt-1.5 hidden group-hover:block w-32 z-50">
                        <div className="rounded-lg border bg-popover p-1 shadow-md text-popover-foreground">
                            <Link
                                to="/profile"
                                className="flex w-full items-center rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                </div>

                <ThemeToggle />
            </div>
        </header>
    );
}