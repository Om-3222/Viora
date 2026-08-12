import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";

export default function Hero() {
    return (
        <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col items-center justify-center px-6 text-center">
            <h1 className="mb-6 text-6xl font-extrabold tracking-tight">
                Secure Video Meetings
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
                VIORA is a modern video calling platform built for seamless one-to-one
                and group communication with real-time chat and file sharing.
            </p>

            <Link to="/login" className={buttonVariants({ size: "lg" })}>
                Get Started
            </Link>
        </section>
    );
}