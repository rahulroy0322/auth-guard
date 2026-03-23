import type { UserType } from "base";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { nanoid } from "nanoid";
import {
	AuthBadError,
	AuthConflictError,
	AuthError,
	AuthExpiredError,
	AuthNoTokenError,
	AuthNotVerifiedError,
	AuthServerError,
	AuthUnAuthenticatedError,
	AuthWrongTokenError,
} from "./error";
import type {
	AuthType,
	CheckAuthType,
	ForgotPasswordType,
	LoginRequiredType,
	LoginType,
	LogoutType,
	LogType,
	RegisterType,
	ResetPasswordType,
	StartVerificationType,
	TokenRefreshType,
	TokenType,
	VerifieAccountType,
} from "./types";
import { hashPassword, validPassword } from "./utils/password";
import { signToken, verifyToken } from "./utils/token";

const init: AuthType = ({
	User: { findById, findByEmail, create: createUser, updateById },
	Cache: { set: setCache, get: getCache, remove: removeCache },
	Mail: { sendMail },
	extractToken,
	jwt,
	logger,
}) => {
	const blocked = new AuthUnAuthenticatedError("Maybe you got blocked");
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

	const sendCode = async ({
		reqId,
		userId,
	}: {
		userId: string;
		reqId: string;
	}) => {
		logger.trace({ reqId }, "Generating Code");
		const code = nanoid().slice(4, 4 + 6);

		logger.trace({ reqId }, "Saving code");
		await setCache(`code:${userId}`, code, 60 * 10);
		logger.trace({ reqId }, "Code saved");

		logger.trace({ reqId }, "Sending code");
		await sendMail(code);
		logger.trace({ reqId }, "Code send succefully!");
	};

	const forgotPassword: ForgotPasswordType = async ({ email }) => {
		const reqId = genReqId();

		logger.trace(
			{
				email,
				reqId,
			},
			"Checking User For Forgot req!",
		);

		const user = await findByEmail(email);

		logger.trace({ reqId, user }, "User fetched For Forgot req");
		if (!user) {
			logError({
				msg: "Failed to get User For Forgot req",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					email,
				},
			});
			throw new AuthBadError("Email is invalid!");
		}

		logger.trace({ reqId }, "Chacking if registered or maybe social");
		if (!user.password) {
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
			throw new AuthBadError("Email is invalid!");
		}

		logger.trace({ reqId }, "Checking if user is verified");
		if (!user.verifiedAt) {
			logError({
				msg: "User is not verified",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
			});
			throw new AuthBadError(
				"your account is not verified yet,plese verify first:)",
			);
		}

		logger.trace({ reqId }, "Account is verified check if already req made");
		if (await getCache(`code:${user.id}`)) {
			logError({
				msg: "Too Many Requests",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
			});
			return {
				id: user.id,
			};
		}

		// TODO! clear session

		sendCode({
			reqId,
			userId: user.id,
		});

		return {
			id: user.id,
		};
	};

	const resetPassword: ResetPasswordType = async ({
		id,
		password: passwd,
		code,
	}) => {
		const reqId = genReqId();

		logger.trace(
			{
				id,
				reqId,
			},
			"Checking User For reset password!",
		);

		logger.trace({ reqId }, "Checking for code in reset password");
		const cachedCode = await getCache(`code:${id}`);

		if (!cachedCode || cachedCode !== code) {
			logError({
				msg: "Code not matched in reset password",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					cachedCode,
					code,
					id,
				},
			});
			throw new AuthBadError("Invalid Code");
		}

		await removeCache(`code:${id}`);

		logger.trace({ reqId }, "Hashing Password");
		const password = await hashPassword(passwd);

		logger.trace({ reqId }, "Reseting user Password");
		if (
			!(await updateById(id, {
				password,
			}))
		) {
			logError({
				msg: "Failed to update User",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					id,
				},
			});
			throw new AuthBadError("Invalid Code");
		}

		logger.trace({ reqId }, "Fetching updated user in reset password");
		const user = await findById(id);

		if (!user) {
			// ? this should never called
			logError({
				msg: "Failed to get User after reset password",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					id,
				},
			});
			throw new AuthServerError();
		}

		// TODO! clear session

		const { token } = signTokens({
			reqId,
			data: user,
		});

		log({
			msg: "User Password reset Succesful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		// @ts-expect-error
		delete user.password;

		return {
			token,
			user,
		};
	};

	const startVerification: StartVerificationType = async ({ email }) => {
		const reqId = genReqId();

		logger.trace(
			{
				email,
				reqId,
			},
			"Checking User For Starting verification!",
		);

		const user = await findByEmail(email);

		logger.trace({ reqId, user }, "User fetched For Start verification");
		if (!user) {
			logError({
				msg: "Failed to get User For Start verification",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					email,
				},
			});
			throw new AuthBadError("Email is invalid!");
		}

		logger.trace({ reqId }, "Checking if user is already verified");
		if (user.verifiedAt) {
			logError({
				msg: "User is already verified",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
			});
			throw new AuthBadError("your account is already verified:)");
		}

		logger.trace({ reqId }, "Account is not verified,removing old code's");
		await removeCache(`code:${user.id}`);

		sendCode({
			reqId,
			userId: user.id,
		});

		return {
			id: user.id,
		};
	};

	const verifieAccount: VerifieAccountType = async ({ id, code }) => {
		const reqId = genReqId();

		logger.trace(
			{
				id,
				reqId,
			},
			"Checking User For verify!",
		);

		logger.trace({ reqId }, "Checking for code");
		const cachedCode = await getCache(`code:${id}`);

		if (!cachedCode || cachedCode !== code) {
			logError({
				msg: "Code not matched",
				who: "[SYSTEM]",
				reqId,
				userId: id,
				extra: {
					cachedCode,
					code,
				},
			});
			throw new AuthBadError("Invalid Code");
		}

		const user = await updateById(id, {
			verifiedAt: new Date(),
		});

		logger.trace({ reqId, user }, "User updated For verify");
		if (!user) {
			logError({
				msg: "Failed to update User",
				who: "[SYSTEM]",
				reqId,
				userId: null,
				extra: {
					id,
				},
			});
			throw new AuthBadError("Invalid Code");
		}

		logger.trace({ reqId }, "Account is verified,removing all code's");
		await removeCache(`code:${user.id}`);

		logger.trace({ reqId }, "Fetching updated user in verifie");
		const uptodatedUser = await findById(user.id);
		if (!uptodatedUser) {
			// ? this should never called
			logError({
				msg: "Failed to get User after verify",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
				extra: {
					id,
				},
			});
			throw new AuthServerError();
		}

		const { token } = signTokens({
			reqId,
			data: uptodatedUser,
		});

		log({
			msg: "User Verification Succesful:)",
			userId: uptodatedUser.id,
			who: uptodatedUser.name,
			reqId,
		});

		// @ts-expect-error
		delete uptodatedUser.password;

		return {
			token,
			user: uptodatedUser,
		};
	};

	const register: RegisterType = async ({ password: passwd, ...data }) => {
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
		const password = await hashPassword(passwd);

		logger.trace({ reqId }, "Creating User");
		const user = await createUser({
			...data,
			password,
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

		sendCode({ userId: user.id, reqId });

		log({
			msg: "User Registretion Succesful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		return {
			id: user.id,
		};
	};

	const login: LoginType = async ({ password: passwd, email }) => {
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

		logger.trace({ reqId }, "Checking if user is verified");
		if (!user.verifiedAt) {
			logError({
				msg: "User Is not verified",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
			});
			throw new AuthNotVerifiedError();
		}

		logger.trace({ reqId }, "Checking if user is banned");
		if (user.isBaned) {
			logError({
				msg: "User Is banned",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
			});
			throw blocked;
		}

		logger.trace({ reqId }, "Chacking if registered or maybe social");
		if (!user.password) {
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

		if (!(await validPassword({ current: passwd, hash: user.password }))) {
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
		delete user.password;

		// TODO! add profiles and avaters
		return {
			token,
			user,
		};
	};

	const checkAuth: CheckAuthType = async (req, reqId) => {
		if (!reqId) {
			reqId = genReqId();
		}

		logger.trace({ reqId }, "Checking Token to authenticate");

		const [, token] = (extractToken.access(req) || "").split(" ");

		if (!token) {
			return {
				user: null,
			};
		}

		const { user } = await verifyAndCheckBan({
			reqId,
			token: token,
			type: "access",
		});

		log({
			msg: "Authenticate Succesful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});
		return {
			user,
		};
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

	const verifyAndCheckBan = async ({
		token: _token,
		type: reqType,
		reqId,
	}: {
		token: string;
		type: TokenType["type"];
		reqId: string;
	}) => {
		try {
			logger.trace({ reqId }, "Token found varifing token");
			const token = verifyToken(_token, jwt.secret);
			const { id, type } = token;
			if (type !== reqType) {
				logError({
					msg: "Wrong Token provided in verifyAndCheckBan",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token: _token,
						expected: reqType,
						got: type,
					},
				});
				throw new AuthWrongTokenError();
			}

			logger.trace({ reqId, token }, "Checking For token Baned");

			const baned = await getCache(`token:${_token}`);

			if (baned) {
				logError({
					msg: "Banned Token Found",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token: _token,
					},
				});
				throw new AuthBadError("You Have loged out previously");
			}

			logger.trace(
				{
					id,
					reqId,
				},
				"Checking User in verifyAndCheckBan, this must be chached!",
			);

			const user = await findById(id);

			if (!user || user.isBaned) {
				logError({
					msg: "Failed to get User",
					who: "[SYSTEM]",
					reqId,
					userId: id,
					extra: {
						token: _token,
					},
				});
				throw blocked;
			}

			log({
				msg: "Verifyed not Ban:)",
				userId: user.id,
				who: user.name,
				reqId,
			});

			return {
				user,
				token,
			};
		} catch (e) {
			if (e instanceof TokenExpiredError) {
				throw new AuthExpiredError();
			}

			if (e instanceof AuthError || e instanceof JsonWebTokenError) {
				throw e;
			}

			throw new AuthError((e as Error).message);
		}
	};

	const tokenRefresh: TokenRefreshType = async (req) => {
		const reqId = genReqId();

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

		const {
			token: { exp },
			user,
		} = await verifyAndCheckBan({
			reqId,
			token: _token,
			type: "refresh",
		});

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
		delete user.password;

		return {
			token,
			user,
		};
	};

	const logout: LogoutType = async (req) => {
		const reqId = genReqId();

		logger.trace({ reqId }, "Checking Tokens to logout");

		const [, accessToken] = (extractToken.access(req) || "").split(" ");

		const [, refreshToken] = (extractToken.refresh(req) || "").split(" ");

		console.log(accessToken, refreshToken);

		const promises: Promise<void>[] = [];

		if (accessToken) {
			logger.trace({ reqId }, "Access Token found Baning it");

			promises.push(
				setCache(`token:${accessToken}`, accessToken, jwt.expires.access),
			);
		}

		if (refreshToken) {
			logger.trace({ reqId }, "Refresh Token found Baning it");

			promises.push(
				setCache(`token:${refreshToken}`, refreshToken, jwt.expires.refresh),
			);
		}

		if (promises.length) {
			logger.trace({ reqId }, "Some Token found to Ban");
			await Promise.all(promises);
			logger.trace({ reqId }, "Tokens Baned succesfully");
		}
	};

	return {
		register,
		login,
		logout,
		startVerification,
		verifieAccount,
		forgotPassword,
		resetPassword,
		checkAuth,
		loginRequired,
		tokenRefresh,
	};
};

const auth = init;

export { auth, init };
