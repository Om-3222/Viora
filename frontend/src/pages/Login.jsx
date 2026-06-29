import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { loginSchema } from "@/features/auth/authSchema";
import { loginUser } from "@/features/auth/authService";
import { setUser } from "@/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values) => {
        try {
            const data = await loginUser(values);

            dispatch(setUser(data.user));

            navigate("/dashboard");
        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
            <h1 className="mb-6 text-3xl font-bold">Welcome Back</h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <div>
                    <Input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                    />
                    <p className="mt-1 text-sm text-red-500">
                        {errors.email?.message}
                    </p>
                </div>

                <div>
                    <Input
                        type="password"
                        placeholder="Password"
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
                    {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    className="font-medium text-primary"
                >
                    Register
                </Link>
            </p>
        </div>
    );
}