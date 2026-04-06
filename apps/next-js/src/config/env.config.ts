import { createEnv } from "next-env-safe";
import pino from "pino";
import { z } from "zod";

const ENV = createEnv({
	server: {
		LEBEL: z
			.enum(Object.keys(pino.levels.values) as pino.LevelWithSilent[])
			.default("debug"),
		JWT_SECRET: z.string().min(25),
		// db
		DB_HOST: z.string(),
		DB_USER: z.string(),
		DB_PASSWORD: z.string(),
		DB_DATABASE: z.string(),

		// Email
		MAIL_HOST: z.string(),
		MAIL_PORT: z.coerce.number(),
		MAIL_USER: z.email(),
		MAIL_PASS: z.string(),

		// OAuth

		// google
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),

		// github
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
	},
	client: {
		NEXT_PUBLIC_API_URL: z.url(),
	},
	runtimeEnv: process.env,
});

const isDev = process.env.NODE_ENV === "development";

export { ENV, isDev };
