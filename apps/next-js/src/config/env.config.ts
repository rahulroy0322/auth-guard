import { createEnv } from "@t3-oss/env-nextjs";
import pino from "pino";
import { z } from "zod";

const ENV = createEnv({
	server: {
		LABEL: z
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
	runtimeEnv: {
		LABEL: process.env.LABEL,
		JWT_SECRET: process.env.JWT_SECRET,
		// db
		DB_HOST: process.env.DB_HOST,
		DB_USER: process.env.DB_USER,
		DB_PASSWORD: process.env.DB_PASSWORD,
		DB_DATABASE: process.env.DB_DATABASE,

		// Email
		MAIL_HOST: process.env.MAIL_HOST,
		MAIL_PORT: process.env.MAIL_PORT,
		MAIL_USER: process.env.MAIL_USER,
		MAIL_PASS: process.env.MAIL_PASS,

		// OAuth
		// google
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

		// github
		GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
		GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

		// client
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
});

const isDev = process.env.NODE_ENV === "development";

export { ENV, isDev };
