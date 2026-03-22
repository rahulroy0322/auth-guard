import type { UserType } from "base";
import { z } from "zod";

const passwordSchema = z
	.string("Password must be a string")
	.min(8, "Password must be at least 8 characters")
	.regex(/(?:.*[a-z]){2,}/, "Must contain at least 2 lowercase letters")
	.regex(/(?:.*[A-Z]){2,}/, "Must contain at least 2 uppercase letters")
	.regex(/(?:.*[0-9]){2,}/, "Must contain at least 2 numbers")
	.regex(
		/(?:.*[^a-zA-Z0-9]){2,}/,
		"Must contain at least 2 special characters",
	);

const registerSchema = z.object({
	name: z.string("Name is required").min(1, "Name is required"),
	email: z.email(),
	password: passwordSchema,
}) satisfies z.ZodType<Omit<UserType, "roles" | "id">>;

const loginSchema = registerSchema.pick({
	email: true,
	password: true,
}) satisfies z.ZodType<Omit<UserType, "roles" | "id" | "name">>;

export { loginSchema, passwordSchema, registerSchema };
