import { z } from "zod";


export const registerSchema = z.object({
    name: z.string().min(2, "Name must be atleast 2 characters"),
    email: z.email("Invalid Email Address"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
});

export const loginSchema = z.object({
    email: z.email("Invalid Email Address"),
    password: z.string().min(6, "Password must be atleast 6 characters"),
});