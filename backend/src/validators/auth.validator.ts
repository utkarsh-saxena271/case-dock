import z from "zod";

export const registerSchema = z.object({
    fullName : z.object({
        firstName : z.string().min(1,"First Name is required"),
        lastName : z.string().min(1,"Last Name is required")
    }),
    userName : z.string().min(3, "Username must be atleast 3 characters"),
    email: z.email("Invalid email"),
    enrollmentNumber: z.string(),
    password: z.string().min(8,"Password must be atleast 8 character long")
})

export const loginSchema = z.object({
    email:z.email("Invalid email"),
    password:z.string()
})

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email")
})
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
})