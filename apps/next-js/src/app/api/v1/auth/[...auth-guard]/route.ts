import { initMail } from "@auth-guard/mail";
import { handleAuth } from "@auth-guard/nextjs/server";
import { ENV, isDev } from "@/config/env.config";
import { logger } from "@/logger/pino";
import * as Avatar from "@/services/avatar.service";
import * as Profile from "@/services/profile.service";
import * as Session from "@/services/session.service";
import * as User from "@/services/user.service";

const mail = initMail({
	host: ENV.MAIL_HOST,
	port: ENV.MAIL_PORT,
	secure: !isDev,
	auth: {
		user: ENV.MAIL_USER,
		pass: ENV.MAIL_PASS,
	},
});

const handler = handleAuth({
	jwtSecret: ENV.JWT_SECRET,
	logger,
	User,
	Avatar,
	Profile,
	Session,
	Cache: {
		set: async () => {},

		get: async () => null,

		remove: async () => {},
	},
	Mail: {
		sendMail: mail,
	},

	OAuth: {
		callbackUri: `${ENV.NEXT_PUBLIC_API_URL}/api/v1/auth/oauth/callback/`,
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

export {
	handler as GET,
	handler as POST,
	handler as PATCH,
	handler as DELETE,
	handler as PUT,
};
