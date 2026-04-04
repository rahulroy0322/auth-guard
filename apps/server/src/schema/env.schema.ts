import pino from "pino";
import z from "zod";

const ENV_CONSTS = ["dev", "debug", "test", "prod"] as const;

export { ENV_CONSTS };

const transformToArray = (str: string) =>
	str
		.split(",")
		.map((url: string) => url.trim())
		.filter(Boolean);

const envSchema = z.object({
	LEBEL: z
		.enum(Object.keys(pino.levels.values) as pino.LevelWithSilent[])
		.default("debug"),
	PORT: z.coerce.number().optional().default(8000).describe("PORT to run on"),
	ENV: z
		.enum(ENV_CONSTS)
		.optional()
		.default("dev")
		.describe("which env running?"),
	APP_URL: z.url(),
	// DB
	DB_HOST: z.string(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_DATABASE: z.string(),

	REDIS_URI: z.string(),
	JWT_SECRET: z.string().min(25),
	FRONTEND_URLS: z
		.string()
		.refine((value) => {
			const urlArray = transformToArray(value);

			const invalidUrls = urlArray.filter((url) => {
				try {
					z.url().parse(url);
					return false;
				} catch (e: unknown) {
					return (e as z.ZodError).message;
				}
			});
			return invalidUrls.length === 0;
		})
		.transform((value) => transformToArray(value)),

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
});

type EnvType = z.infer<typeof envSchema>;

export type { EnvType };

export { envSchema };
