import {
    Video,
    Users,
    MessageSquareMore,
} from "lucide-react";

const features = [
    {
        icon: Video,
        title: "HD Video Calling",
        description:
            "Experience crystal-clear one-to-one and group video calls powered by WebRTC.",
    },
    {
        icon: MessageSquareMore,
        title: "Real-Time Chat",
        description:
            "Chat instantly during meetings with file sharing, emojis and reactions.",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description:
            "Create meeting rooms, invite participants and collaborate seamlessly.",
    },
];

export default function Features() {
    return (
        <section
            id="features"
            className="border-t bg-muted/30 py-24"
        >
            <div className="mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <h2 className="text-4xl font-bold">
                        Everything you need to communicate
                    </h2>

                    <p className="mt-4 text-muted-foreground">
                        Built for modern teams with lightning-fast communication,
                        collaboration and secure meetings.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="group rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-xl"
                            >
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="h-7 w-7" />
                                </div>

                                <h3 className="mb-3 text-xl font-semibold">
                                    {feature.title}
                                </h3>

                                <p className="leading-7 text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}