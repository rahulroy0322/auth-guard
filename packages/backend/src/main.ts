import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import {
	AuthBadError,
	AuthConflictError,
	AuthError,
	AuthExpiredError,
	AuthNoTokenError,
	AuthServerError,
	AuthUnAuthenticatedError,
	AuthWrongTokenError,
} from "./error";
import type {
	AuthType,
	CheckAuthType,
	LoginRequiredType,
	LoginType,
	LogType,
	RegisterType,
	TokenRefreshType,
	UserType,
} from "./types";
import { hashPassword, validPassword } from "./utils/password";
import { signToken, verifyToken } from "./utils/token";

const init: AuthType = ({
	User: { findById, findByEmail, create: createUser },
	extractToken,
	jwt,
	logger,
}) => {
	const genReqId = (): string => {
		// TODO!
		return "[UUID]";
	};

	const logError = (log: LogType) => {
		// todo!
		logger.error(log);
	};

	const log = (log: LogType) => {
		// todo!

		logger.info(log);
	};

	const signTokens = (props: {
		reqId: string;
		data: Pick<UserType, "id" | "name">;
	}) => {
		const {
			reqId,
			data: { id, name },
		} = props;

		logger.trace({ reqId }, "Createing RefreshToken");
		const refresh = signToken({ id, type: "refresh" }, jwt.secret, {
			expiresIn: jwt.expires.refresh,
		});

		logger.trace({ reqId }, "Createing AccessToken");
		const access = signToken({ id, type: "access" }, jwt.secret, {
			expiresIn: jwt.expires.access,
		});

		log({
			msg: "User Login Succesful:)",
			userId: id,
			who: name,
			reqId,
		});

		return {
			token: {
				refresh,
				access,
			},
		};
	};

	const register: RegisterType = async ({ pass: passwd, ...data }) => {
		const reqId = genReqId();

		logger.trace(
			{
				...data,
				reqId,
			},
			"Checking User For Register!",
		);
		const existingUser = (await findByEmail(data.email)) ?? null;

		if (existingUser) {
			logError({
				msg: "Trying to Create Account Again",
				who: existingUser.name,
				userId: existingUser.id,
			});
			throw new AuthConflictError("User Already Exists!");
		}

		logger.trace({ reqId }, "Hashing Password");
		const pass = await hashPassword(passwd);

		logger.trace({ reqId }, "Creating User");
		const user = await createUser({
			...data,
			pass,
			roles: ["user"],
		});
		logger.trace({ reqId, user }, "User Created");

		if (!user) {
			const msg = "User created but not returned";
			logError({
				msg,
				who: "[SYSTEM]",
				userId: null,
				reqId,
				extra: data,
			});
			throw new AuthServerError(msg);
		}

		const { token } = signTokens({
			reqId,
			data: user,
		});

		log({
			msg: "User Registretion Succesful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		// @ts-expect-error
		delete user.pass;

		return {
			token,
			user,
		};
	};

	const login: LoginType = async ({ pass: passwd, email }) => {
		const reqId = genReqId();

		logger.trace(
			{
				email,
				reqId,
			},
			"Checking User For Login!",
		);
		const user = await findByEmail(email);

		logger.trace({ reqId, user }, "User fetched For login");
		if (!user) {
			logError({
				msg: "Failed to get User",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					email,
				},
			});
			throw new AuthBadError("Email or Password is invalid!");
		}

		logger.trace({ reqId }, "Chacking if registered or maybe social");
		if (!user.pass) {
			// social login
			logError({
				msg: "Trying To Login With Password with no pass",
				who: user.name,
				reqId,
				userId: user.id,
				extra: {
					email,
				},
			});
			throw new AuthBadError("invalid mathod of login!");
		}

		logger.trace({ reqId }, "Validating Password");
		if (
			!(await validPassword({
				current: passwd,
				hash: user.pass,
			}))
		) {
			logError({
				msg: "Password not match",
				who: user.name,
				userId: user.id,
				reqId,
				extra: {
					email,
				},
			});
			throw new AuthBadError("Email or Password is invalid!");
		}

		const { token } = signTokens({
			reqId,
			data: user,
		});

		log({
			msg: "User Login Succesful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		// @ts-expect-error
		delete user.pass;

		return {
			token,
			user,
		};
	};

	const checkAuth: CheckAuthType = async (req, reqId) => {
		if (!reqId) {
			reqId = genReqId();
		}

		try {
			logger.trace({ reqId }, "Checking Token to authenticate");

			const [, token] = (extractToken.access(req) || "").split(" ");

			if (!token) {
				return {
					user: null,
				};
			}

			logger.trace({ reqId }, "Token found varifing token");
			const { id, type } = verifyToken(token, jwt.secret);

			if (type === "refresh") {
				logError({
					msg: "Wrong Token provided in loginRequired",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token,
					},
				});
				throw new AuthWrongTokenError();
			}

			logger.trace({ reqId, token }, "Checking For token Baned");
			console.error("TODO!");

			logger.trace(
				{
					id,
					reqId,
				},
				"Checking User For to authenticate this must be chached!",
			);
			const user = await findById(id);

			// ? add ban check
			if (!user) {
				logError({
					msg: "Failed to get User",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token,
					},
				});
				throw new AuthUnAuthenticatedError("Maybe you got blocked");
			}

			log({
				msg: "Authenticate Succesful:)",
				userId: user.id,
				who: user.name,
				reqId,
			});
			return {
				user,
			};
		} catch (e) {
			// todo!
			if (e instanceof TokenExpiredError) {
				throw new AuthExpiredError();
			}

			if (e instanceof AuthError || e instanceof JsonWebTokenError) {
				throw e;
			}

			throw new AuthError((e as Error).message);
		}
	};

	const loginRequired: LoginRequiredType = async (req) => {
		const reqId = genReqId();

		const { user } = await checkAuth(req, reqId);

		if (!user) {
			logError({
				msg: "Token Not Found",
				who: "[SYSTEM]",
				reqId,
				userId: null,
			});
			throw new AuthNoTokenError();
		}

		return {
			user,
		};
	};

	const tokenRefresh: TokenRefreshType = async (req) => {
		const reqId = genReqId();

		try {
			logger.trace({ reqId }, "Checking Token to refresh");

			const [, _token] = (extractToken.refresh(req) || "").split(" ");

			if (!_token) {
				logError({
					msg: "Token Not Found",
					who: "[SYSTEM]",
					reqId,
					userId: null,
				});
				throw new AuthNoTokenError();
			}

			logger.trace({ reqId }, "Token found varifing token");
			const { id, type, exp } = verifyToken(_token, jwt.secret);

			if (type === "access") {
				logError({
					msg: "Wrong Token provided in tokenRefresh",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token: _token,
					},
				});
				throw new AuthWrongTokenError();
			}

			logger.trace({ reqId, _token }, "Checking For token Baned");
			console.error("TODO!");

			logger.trace(
				{
					id,
					reqId,
				},
				"Checking User For to authenticate this must be chached!",
			);
			const user = await findById(id);

			// ? add ban check
			if (!user) {
				logError({
					msg: "Failed to get User",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token: _token,
					},
				});
				throw new AuthUnAuthenticatedError("Maybe you got blocked");
			}

			const { token } = signTokens({
				reqId,
				data: user,
			});

			const expiry = new Date(exp * 1000);

			if (!(expiry <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 2))) {
				// @ts-expect-error
				delete token.refresh;
			}

			log({
				msg: "Token Refresh Succesful:)",
				userId: user.id,
				who: user.name,
				reqId,
			});

			// @ts-expect-error
			delete user.pass;

			return {
				token,
				user,
			};
		} catch (e) {
			// todo!
			if (e instanceof TokenExpiredError) {
				throw new AuthExpiredError();
			}

			if (e instanceof AuthError || e instanceof JsonWebTokenError) {
				throw e;
			}

			throw new AuthError((e as Error).message);
		}
	};

	return {
		register,
		login,
		checkAuth,
		loginRequired,
		tokenRefresh,
	};
};

const auth = init;

export { auth, init };
