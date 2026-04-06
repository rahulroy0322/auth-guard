import { auth } from "@auth-guard/express";
import { initMail } from "@auth-guard/mail";
import type { Request } from "express";
import { redis } from "../cache/main";
import ENV, { isDev } from "../config/env.config";
import { logger } from "../logger/pino";
import * as Avatar from "../services/avatar.service";
import * as Profile from "../services/profile.service";
import * as Session from "../services/session.service";
import * as User from "../services/user.service";

const mail = initMail({
	host: ENV.MAIL_HOST,
	port: ENV.MAIL_PORT,
	secure: !isDev,
	auth: {
		user: ENV.MAIL_USER,
		pass: ENV.MAIL_PASS,
	},
});

const extractAccessToken = async (req: Request) =>
	req.headers.authorization || (req.headers.token as string) || null;

const extractRefreshToken = async (req: Request) => {
	const token: string | null = req.cookies?.["auth-refresh"];

	if (!token) {
		return null;
	}

	return `Bearer ${token}`;
};

const guard = auth({
	cookie: {
		access: "auth-access",
		refresh: "auth-refresh",
		extract: (req, key) => req.cookies?.[key] || null,
	},
	jwt: {
		expires: {
			access: 60 * 15,
			refresh: 60 * 60 * 24 * 7,
		},
		secret: ENV.JWT_SECRET,
	},
	extractToken: {
		access: extractAccessToken as () => Promise<string | null>,
		refresh: extractRefreshToken as () => Promise<string | null>,
	},
	logger,
	User,
	Avatar,
	Profile,
	Session,
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
		sendMail: mail,
	},

	OAuth: {
		callbackUri: `${ENV.APP_URL}/oauth/callback/`,
		providers: {
			google: {
				clientId: ENV.GOOGLE_CLIENT_ID,
				clientSecret: ENV.GOOGLE_CLIENT_SECRET,
			},
			github: {
				clientId: ENV.GITHUB_CLIENT_ID,
				clientSecret: ENV.GITHUB_CLIENT_SECRET,
			},
		},
	},
});

export { guard };
