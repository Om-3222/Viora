import { Link } from "react-router-dom";

export default function Footer() {
    const quickLinks = [
        { label: "Home", to: "/" },
        { label: "Features", to: "/#features" },
        { label: "Login", to: "/login" },
        { label: "Register", to: "/register" },
    ];

    return (
        <footer className="border-t bg-background">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-10 md:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <Link
                            to="/"
                            className="text-2xl font-bold tracking-tight text-primary"
                        >
                            VIORA
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
                            Modern video calling built for teams with secure meetings,
                            real-time messaging and effortless collaboration.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="mb-4 font-semibold">Quick Links</h3>

                        <div className="flex flex-col gap-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.to}
                                    className="text-muted-foreground transition-colors hover:text-primary"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="mb-4 font-semibold">Connect</h3>

                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="rounded-lg border p-3 transition hover:border-primary hover:text-primary"
                            >
                                GitHub
                            </a>

                            <a
                                href="#"
                                className="rounded-lg border p-3 transition hover:border-primary hover:text-primary"
                            >
                                Twitter
                            </a>

                            <a
                                href="#"
                                className="rounded-lg border p-3 transition hover:border-primary hover:text-primary"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} VIORA. All rights reserved.
                </div>
            </div>
        </footer>
    );
}