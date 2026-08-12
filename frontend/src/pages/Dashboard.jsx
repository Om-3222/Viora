import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "@/features/users/usersSlice";
import Contacts from "@/components/dashboard/Contacts";
import NewMeetingCard from "@/components/dashboard/NewMeetingCard";
import RecentMeetings from "@/components/dashboard/RecentMeetings";



export default function Dashboard() {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    return (
        <div className="space-y-12 px-18">
            <section>
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to VIORA
                </h1>

                <p className="mt-3 text-lg text-muted-foreground">
                    Meet, collaborate and stay connected.
                </p>
            </section>

            <NewMeetingCard />

            <div className="grid gap-16 lg:grid-cols-2">
                <Contacts />

                <RecentMeetings />
            </div>
        </div>
    );
}