import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { registerSchema } from "@/features/auth/authSchema";
import { registerUser } from "@/features/auth/authService";
import { setUser } from "@/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (values) => {
        try {
            const data = await registerUser(values);

            dispatch(setUser(data.user));

            navigate("/dashboard");
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
            <h1 className="mb-6 text-3xl font-bold">Create Account</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <div>
                    <Input
                        placeholder="Name"
                        {...register("name")}
                    />
                    <p className="mt-1 text-sm text-red-500">
                        {errors.name?.message}
                    </p>
                </div>

                <div>
                    <Input
                        placeholder="Email"
                        type="email"
                        {...register("email")}
                    />
                    <p className="mt-1 text-sm text-red-500">
                        {errors.email?.message}
                    </p>
                </div>

                <div>
                    <Input
                        placeholder="Password"
                        type="password"
                        {...register("password")}
                    />
                    <p className="mt-1 text-sm text-red-500">
                        {errors.password?.message}
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="font-medium text-primary"
                >
                    Login
                </Link>
            </p>
        </div>
    );
}