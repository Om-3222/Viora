import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button-variants";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";

export default function Navbar() {
    const links = [
        { name: "Home", to: "/" },
        { name: "Features", to: "/#features" },
    ];

    return (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Logo />

                {/* Desktop */}
                <nav className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            to={link.to}
                            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <ThemeToggle />

                    <Link
                        to="/login"
                        className={buttonVariants({ variant: "default" })}
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />

                    <Sheet>
                        <SheetTrigger
                            className={buttonVariants({ variant: "ghost", size: "icon" })}
                        >
                            <Menu className="h-6 w-6" />
                        </SheetTrigger>

                        <SheetContent side="right" className="w-72">
                            <div className="mt-10 flex flex-col gap-6">
                                {links.map((link) => (
                                    <SheetClose
                                        key={link.name}
                                        nativeButton={false}
                                        render={
                                            <Link
                                                to={link.to}
                                                className="text-lg font-medium hover:text-primary"
                                            />
                                        }
                                    >
                                        {link.name}
                                    </SheetClose>
                                ))}

                                <SheetClose
                                    nativeButton={false}
                                    render={
                                        <Link
                                            to="/login"
                                            className={cn(
                                                buttonVariants({ variant: "default" }),
                                                "mt-4 w-full text-center flex justify-center"
                                            )}
                                        />
                                    }
                                >
                                    Get Started
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}


