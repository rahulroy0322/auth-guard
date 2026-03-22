import type { IncomingMessage } from "node:http";
import { auth } from "@auth-guard/express";
import ENV from "../config/env.config";
import { logger } from "../logger/pino";
import * as User from "../services/user.service";

const extractToken = (req: IncomingMessage) =>
	req.headers.authorization || (req.headers.token as string) || null;
// ? maybe u can add cookie extract here
// * req.c

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
		access: extractToken,
		refresh: extractToken,
	},
	logger,
	User,
});

export { guard };
