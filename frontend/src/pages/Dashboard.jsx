import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "@/features/users/usersSlice";
import Contacts from "@/components/dashboard/Contacts";
import { useSelector } from "react-redux";
import NewMeetingCard from "@/components/dashboard/NewMeetingCard";
import RecentCalls from "@/components/dashboard/RecentCalls";
import ScheduledMeetings from "@/components/dashboard/ScheduledMeetings";



export default function Dashboard() {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const { users } = useSelector((state) => state.users);

    return (
        <div className="space-y-12">
            <section>
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to VIORA
                </h1>

                <p className="mt-3 text-lg text-muted-foreground">
                    Meet, collaborate and stay connected.
                </p>
            </section>

            <NewMeetingCard />

            <div className="grid gap-8 lg:grid-cols-3">
                <Contacts />

                <RecentCalls />

                <ScheduledMeetings />
            </div>
        </div>
    );
}