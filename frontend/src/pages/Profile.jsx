import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { setUser } from "@/features/auth/authSlice";

export default function Profile() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");
        setError("");

        try {
            const { data } = await api.put("/users/profile", { name, email });
            dispatch(setUser(data.user));
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-8 shadow-sm mt-10">
            <h1 className="mb-6 text-3xl font-bold">Your Profile</h1>

            {message && <p className="mb-4 text-sm font-medium text-green-500">{message}</p>}
            {error && <p className="mb-4 text-sm font-medium text-red-500">{error}</p>}

            <form onSubmit={onSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium">Name</label>
                    <Input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || (!name || !email) || (name === user?.name && email === user?.email)}
                >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </div>
    );
}
