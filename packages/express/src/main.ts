import { init as core } from "@auth-guard/backend";
import { AuthServerError } from "@auth-guard/backend/error";
import type { RequestHandler, Response } from "express";
import { loginSchema, registerSchema } from "schema";
import type { AuthExpressType, ResType } from "./types";

const options = {
	sameSite: "strict",
	secure: true,
	httpOnly: true,
	path: "/",
} as const;

const init: AuthExpressType = ({ cookie, ...props }) => {
	const coreApi = core(props);

	const setAuthCookie = (
		res: Response,
		{
			access,
			refresh,
		}: {
			refresh?: string;
			access: string;
		},
	) => {
		res.cookie(cookie.access, access, {
			...options,
			expires: new Date(Date.now() + 1000 * props.jwt.expires.access),
		});
		if (refresh) {
			res.cookie(cookie.refresh, refresh, {
				...options,
				expires: new Date(Date.now() + 1000 * props.jwt.expires.refresh),
			});
		}
	};
	const clearAuthCookie = (res: Response) => {
		res.clearCookie(cookie.access);
		res.clearCookie(cookie.access);
	};

	const register: RequestHandler = async (req, res) => {
		const data = registerSchema.parse(req.body || {});

		const { token, user } = await coreApi.register({
			...data,
			password: data.password,
		});

		setAuthCookie(res, token);

		res.status(201).json({
			success: true,
			data: {
				user,
				token,
			},
		} satisfies ResType);
	};

	const login: RequestHandler = async (req, res) => {
		const data = loginSchema.parse(req.body || {});

		const { token, user } = await coreApi.login({
			...data,
			password: data.password,
		});

		setAuthCookie(res, token);

		res.status(200).json({
			success: true,
			data: {
				user,
				token,
			},
		} satisfies ResType);
	};

	const tokenRefresh: RequestHandler = async (req, res) => {
		const { token, user } = await coreApi.tokenRefresh(req);

		setAuthCookie(res, token);

		res.status(200).json({
			success: true,
			data: {
				user,
				token,
			},
		} satisfies ResType);
	};

	const checkAuth: RequestHandler = async (req, _, next) => {
		const { user } = await coreApi.checkAuth(req);
		if (user) {
			req.user = user;
		}
		next();
	};

	const loginRequired: RequestHandler = async (req, _, next) => {
		if (req.user) {
			// already checked
			next();
			return;
		}

		const { user } = await coreApi.loginRequired(req);
		req.user = user;
		next();
	};

	const me: RequestHandler = async (req, res) => {
		if (!req.user) {
			throw new AuthServerError("some event dosn't handled properly!");
		}

		res.status(200).json({
			success: true,
			data: {
				user: req.user
			},
		} satisfies ResType);
	};

	const logout: RequestHandler = async (req, res) => {
		if (props.extractToken.access(req) || props.extractToken.refresh(req)) {
			await coreApi.logout(req);
		}

		clearAuthCookie(res);

		res.status(200).json({
			success: true,
			data: {
				message: "Logged Out Succesfully",
			},
		} satisfies ResType);
	};

	return {
		login,
		register,
		logout,
		me,
		tokenRefresh,
		checkAuth,
		loginRequired,
	};
};

const auth = init;

export * from "@auth-guard/backend/error";
export { auth, init };
