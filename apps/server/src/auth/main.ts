import { auth } from "@auth-guard/express";
import type { Request } from "express";
import { redis } from "../cache/main";
import ENV from "../config/env.config";
import { logger } from "../logger/pino";
import * as User from "../services/user.service";

const extractAccessToken = (req: Request) =>
	req.cookies?.["auth-access"] ||
	req.headers.authorization ||
	(req.headers.token as string) ||
	null;

const extractRefreshToken = (req: Request) =>
	req.cookies?.["auth-refresh"] ||
	req.headers.authorization ||
	(req.headers.token as string) ||
	null;

const guard = auth({
	cookie: {
		access: "auth-access",
		refresh: "auth-refresh",
	},
	jwt: {
		expires: {
			access: 60 * 15,
			refresh: 60 * 60 * 24 * 7,
		},
		secret: ENV.JWT_SECRET,
	},
	extractToken: {
		access: extractAccessToken as () => string | null,
		refresh: extractRefreshToken as () => string | null,
	},
	logger,
	User,
	Cache: {
		set: (key, value, seconds) =>
			redis.set(
				key,
				value,
				...(["EX", seconds] as const),
			) as unknown as Promise<void>,

		get: (key) => redis.get(key),

		remove: (key) => redis.del(key) as unknown as Promise<void>,
	},
	Mail: {
		sendMail: async (code) => {
			// TODO! temp not prod ready
			logger.error({ code }, "TODO");
		},
	},
});

export { guard };
