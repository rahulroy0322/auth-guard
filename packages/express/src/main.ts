import { init as core } from "@auth-guard/backend";
import { AuthServerError } from "@auth-guard/backend/error";
import type { RequestHandler, Response } from "express";
import {
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	updateProfileSchema,
	verifieSchema,
} from "schema";
import type { AuthExpressType, ResType, UpdateProfileType } from "./types";
import { unlink } from "node:fs/promises";

const options = {
	sameSite: "strict",
	secure: true,
	httpOnly: true,
	path: "/",
} as const;

const init: AuthExpressType = ({ cookie, ...props }) => {
	const coreApi = core(props);

	const setAuthCookie = (res: Response, refreshToken: string) => {
		res.cookie(cookie.refresh, refreshToken, {
			...options,
			expires: new Date(Date.now() + 1000 * props.jwt.expires.refresh),
		});
	};
	const clearAuthCookie = (res: Response) => {
		res.clearCookie(cookie.refresh);
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
		} = await coreApi.login(data);

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

		res.status(201).json({
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType);
	};

	const verifieAccount: RequestHandler = async (req, res) => {
		const data = verifieSchema.parse({
			...req.body,
			...req.query,
		});

		const {
			token: { access, refresh },
			user,
		} = await coreApi.verifieAccount(data);

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
			throw new AuthServerError("some event dosn't handled properly!");
		}

		res.status(200).json({
			success: true,
			data: {
				user: req.user,
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
		} = await coreApi.resetPassword(data);

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
		} = await coreApi.changePassword(req, data.password);

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

			throw error
		}

		const _data = {} as Parameters<UpdateProfileType>[1]

		if (data.name) {
			_data.name = data.name
		}

		if (data.profileImage) {
			_data.url = `/avatar/${req.file?.filename}`
		}

		console.log({
			_data
		});


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

	return {
		removeAvatar,
		login,
		register,
		logout,
		me,
		startVerification,
		verifieAccount,
		forgotPassword,
		resetPassword,
		tokenRefresh,
		checkAuth,
		loginRequired,
		changePassword,
		updateProfile,
		authStatus,
	};
};

const auth = init;

export * from "@auth-guard/backend/error";
export { auth, init };
