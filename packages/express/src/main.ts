import { unlink } from "node:fs/promises";
import { init as core } from "@auth-guard/backend";
import { AuthServerError } from "@auth-guard/backend/error";
import { genReqId } from "@auth-guard/backend/utils/request-id";
import type { Request, RequestHandler, Response } from "express";
import {
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	updateProfileSchema,
	verifySchema,
} from "schema";
import { UAParser } from "ua-parser-js";
import type {
	AuthExpressPropsType,
	AuthExpressReturnType,
	AuthExpressType,
	ProviderType,
	ResType,
	UpdateProfileType,
} from "./types";

const options = {
	sameSite: "strict",
	secure: true,
	httpOnly: true,
	path: "/",
} as const;

const init: AuthExpressType = <T extends ProviderType>({
	cookie,
	...props
}: AuthExpressPropsType<T>) => {
	const {
		authState = "auth-oauth-state",
		authVerifier = "auth-oauth-verifier",
	} = cookie;
	const coreApi = core(props);

	const getDeviceId = (req: Request, res: Response) => {
		let deviceId = cookie.extract(req, "deviceId");
		if (!deviceId) {
			deviceId = genReqId();
			res.cookie("deviceId", deviceId, {
				...options,
			});
		}
		return deviceId;
	};

	const getDeviceInfo = (req: Request, res: Response) => {
		const ua = new UAParser(req.headers["user-agent"]);

		const deviceId = getDeviceId(req, res);

		return {
			deviceId,
			deviceName: ua.getOS().name || "Unknown",
			deviceType: ua.getBrowser().name || "Unknown",
		};
	};

	const setAuthCookie = (res: Response, refreshToken: string) => {
		res.cookie(cookie.refresh, refreshToken, {
			...options,
			expires: new Date(Date.now() + 1000 * props.jwt.expires.refresh),
		});
	};
	const clearAuthCookie = (res: Response) => {
		res.clearCookie(cookie.refresh);
	};
	const setOAuthStateCookie = (
		res: Response,
		{
			codeVerifier,
			state,
		}: {
			codeVerifier: string;
			state: string;
		},
	) => {
		const expires = new Date(Date.now() + 1000 * 60 * 5);
		res.cookie(authVerifier, codeVerifier, {
			...options,
			sameSite: "lax",
			expires,
		});
		res.cookie(authState, state, {
			...options,
			sameSite: "lax",
			expires,
		});
	};
	const clearOAuthStateCookie = (res: Response) => {
		res.clearCookie(authVerifier);
		res.clearCookie(authState);
	};

	const register: RequestHandler = async (req, res) => {
		const data = registerSchema.parse(req.body || {});

		const { id } = await coreApi.register(data);

		res.status(201).json({
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType);
	};

	const login: RequestHandler = async (req, res) => {
		const data = loginSchema.parse(req.body || {});

		const {
			token: { access, refresh },
			user,
		} = await coreApi.login({
			...data,
			...getDeviceInfo(req, res),
		});

		setAuthCookie(res, refresh);

		res.status(200).json({
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType);
	};

	const startVerification: RequestHandler = async (req, res) => {
		const data = loginSchema
			.pick({
				email: true,
			})
			.parse(req.body || {});

		const { id } = await coreApi.startVerification(data);

		res.status(200).json({
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType);
	};

	const verifyAccount: RequestHandler = async (req, res) => {
		const data = verifySchema.parse({
			...req.body,
			...req.query,
		});

		const {
			token: { access, refresh },
			user,
		} = await coreApi.verifyAccount({
			...data,
			...getDeviceInfo(req, res),
		});

		setAuthCookie(res, refresh);

		res.status(200).json({
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType);
	};

	const tokenRefresh: RequestHandler = async (req, res) => {
		const {
			token: { access, refresh },
		} = await coreApi.tokenRefresh(req);

		if (refresh) {
			setAuthCookie(res, refresh);
		}

		res.status(200).json({
			success: true,
			data: {
				token: access,
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
			throw new AuthServerError("some event wasn't handled properly!");
		}

		res.status(200).json({
			success: true,
			data: {
				user: req.user,
			},
		} satisfies ResType);
	};

	const logout: RequestHandler = async (req, res) => {
		if (
			(await props.extractToken.access(req)) ||
			(await props.extractToken.refresh(req))
		) {
			await coreApi.logout(req);
		}

		clearAuthCookie(res);

		res.status(200).json({
			success: true,
			data: {
				message: "Logged Out Successfully",
			},
		} satisfies ResType);
	};

	const forgotPassword: RequestHandler = async (req, res) => {
		const data = loginSchema
			.pick({
				email: true,
			})
			.parse(req.body || {});

		const { id } = await coreApi.forgotPassword(data);

		res.status(200).json({
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType);
	};

	const resetPassword: RequestHandler = async (req, res) => {
		const data = resetPasswordSchema.parse({
			...req.body,
			...req.query,
		});

		const {
			token: { access, refresh },
			user,
		} = await coreApi.resetPassword({
			...data,
			...getDeviceInfo(req, res),
		});

		setAuthCookie(res, refresh);

		res.status(200).json({
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType);
	};

	const changePassword: RequestHandler = async (req, res) => {
		const data = loginSchema
			.pick({
				password: true,
			})
			.parse(req.body || {});

		const {
			token: { access, refresh },
			user,
		} = await coreApi.changePassword(req, {
			password: data.password,
			...getDeviceInfo(req, res),
		});

		setAuthCookie(res, refresh);

		res.status(200).json({
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType);
	};

	const updateProfile: RequestHandler = async (req, res) => {
		const { data, success, error } = updateProfileSchema.safeParse({
			profileImage: req.file,
			name: req.body.name,
		});

		if (!success) {
			if (req.file?.path) {
				await unlink(req.file.path);
			}

			throw error;
		}

		const _data = {} as Parameters<UpdateProfileType>[1];

		if (data.name) {
			_data.name = data.name;
		}

		if (data.profileImage) {
			_data.url = `/avatar/${req.file?.filename}`;
		}

		const { user } = await coreApi.updateProfile(req, _data);

		res.status(200).json({
			success: true,
			data: {
				user,
			},
		} satisfies ResType);
	};

	const authStatus: RequestHandler = async (req, res) => {
		const status = await coreApi.authStatus(req);

		if (status.user) {
			if (status.token.refresh) {
				setAuthCookie(res, status.token.refresh);
			}
			res.status(200).json({
				success: true,
				data: {
					authenticated: true,
					token: status.token.access,
					user: status.user,
				},
			} satisfies ResType);
		} else {
			res.status(200).json({
				success: true,
				data: {
					authenticated: false,
					user: null,
				},
			} satisfies ResType);
		}
	};

	const removeAvatar: RequestHandler = async (req, res) => {
		const { user } = await coreApi.removeAvatar(req);

		res.status(200).json({
			success: true,
			data: {
				user,
			},
		} satisfies ResType);
	};

	const oAuthStart: RequestHandler<{
		provider: T;
	}> = (req, res) => {
		const { url, state, codeVerifier } = coreApi.oAuthStart(
			req.params.provider,
		);

		setOAuthStateCookie(res, {
			state,
			codeVerifier,
		});

		res.json({
			success: true,
			data: {
				url,
			},
		} satisfies ResType);
	};

	const loginWithProvider: RequestHandler<{
		provider: T;
	}> = async (req, res) => {
		const cookies = { ...req.cookies };
		const codeVerifier = cookies?.[authVerifier];
		const state = cookies?.[authState];

		if (typeof state !== "string" || typeof codeVerifier !== "string") {
			throw new AuthServerError(
				"OAuth flow failed: missing state or verifier cookie.",
			);
		}

		const {
			token: { access, refresh },
			user,
		} = await coreApi.loginWithProvider(req.query, {
			provider: req.params.provider,
			state,
			codeVerifier,
			...getDeviceInfo(req, res),
		});

		clearOAuthStateCookie(res);
		setAuthCookie(res, refresh);

		res.status(200).json({
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType);
	};

	const getSessions: RequestHandler = async (req, res) => {
		const { sessions } = await coreApi.getSessions(req, {
			deviceId: getDeviceId(req, res),
		});

		res.status(200).json({
			success: true,
			data: {
				sessions,
			},
		} satisfies ResType);
	};

	return {
		removeAvatar,
		login,
		register,
		logout,
		me,
		startVerification,
		verifyAccount,
		forgotPassword,
		resetPassword,
		tokenRefresh,
		checkAuth,
		loginRequired,
		changePassword,
		updateProfile,
		authStatus,
		oAuthStart,
		loginWithProvider,
		getSessions,
	} satisfies AuthExpressReturnType<T>;
};

const auth = init;

export * from "@auth-guard/backend/error";
export * from "./types";
export { auth, init };
