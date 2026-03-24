import type { UserType } from "base";
import {
	AuthBadError,
	AuthConflictError,
	AuthNoTokenError,
	AuthServerError,
} from "./error";
import type {
	AuthType,
	CheckAuthType,
	ForgotPasswordType,
	LoginRequiredType,
	LoginType,
	LogoutType,
	RegisterType,
	ResetPasswordType,
	StartVerificationType,
	TokenRefreshType,
	VerifieAccountType,
} from "./types";
import { hashPassword, validPassword } from "./utils/password";
import { genReqId } from "./utils/request-id";
import { SmartLogger } from "./utils/smart-logger";
import { TokenBanManager } from "./utils/token-ban";
import { TokenHelper } from "./utils/token-helpers";
import { UserSanitizer } from "./utils/user-sanitizer";
import { UserValidator } from "./utils/user-validation";
import { CodeManager } from "./utils/verification-code";

const init: AuthType = ({
	User: { findById, findByEmail, create: createUser, updateById },
	Cache,
	Mail: { sendMail },
	extractToken,
	jwt,
	logger: mainLogger,
}) => {
	const logger = new SmartLogger(mainLogger);

	const tokenHelper = new TokenHelper(jwt, logger);
	const codeManager = new CodeManager(Cache, logger);
	const tokenBanManager = new TokenBanManager(Cache, logger);

	const userValidator = new UserValidator(logger);

	const sendCode = async (props: Parameters<CodeManager["generate"]>[0]) => {
		const {
			reqId,
			user: { id: userId },
		} = props;
		const code = await codeManager.generate(props);

		logger.trace({
			reqId,
			msg: "Sending verification code via email",
			extra: {
				userId,
			},
		});
		await sendMail(code);
		logger.trace({
			reqId,
			msg: "Verification code sent successfully",
			extra: {
				userId,
			},
		});
	};

	const findUserAndCheckBan = async (
		userId: string,
		reqId: string,
	): Promise<UserType> => {
		logger.trace({ reqId, extra: { userId }, msg: "Fetching user" });

		const user = await findById(userId);
		const verifiedUser = userValidator.validateExists(user, {
			reqId,
		});
		userValidator.validateNotBanned(verifiedUser, { reqId });

		return verifiedUser;
	};

	const verifyAndCheckBan = async ({
		token: _token,
		type: reqType,
		reqId,
	}: {
		token: string;
		type: "access" | "refresh";
		reqId: string;
	}): Promise<{
		user: UserType;
		token: ReturnType<typeof tokenHelper.verifyAndDecode>;
	}> => {
		const token = tokenHelper.verifyAndDecode({
			reqId,
			token: _token,
			expectedType: reqType,
		});

		logger.trace({
			reqId,
			extra: { token },
			msg: "Checking if token is banned",
		});
		const isBanned = await tokenBanManager.isBanned(_token, reqId);

		if (isBanned) {
			logger.error({
				reqId,
				msg: "Banned token used",
				user: null,
				extra: {
					token: _token,
				},
			});
			throw new AuthBadError("You have logged out previously");
		}

		const user = await findUserAndCheckBan(token.id, reqId);

		logger.info({
			reqId,
			msg: "Token verified and user validated",
			user,
		});

		return { user, token };
	};

	const register: RegisterType = async ({ password: passwd, ...data }) => {
		const reqId = genReqId();

		logger.trace({
			reqId,
			extra: {
				...data,
			},
			msg: "Starting Registration",
		});

		const existingUser = (await findByEmail(data.email)) ?? null;

		if (existingUser) {
			logger.error({
				reqId,
				msg: "Trying to Create Account Again",
				user: existingUser,
			});
			throw new AuthConflictError("User Already Exists!");
		}

		logger.trace({ reqId, msg: "Hashing Password" });
		const password = await hashPassword(passwd);

		logger.trace({ reqId, msg: "Creating User" });
		const user = await createUser({
			...data,
			password,
			roles: ["user"],
		});

		if (!user) {
			logger.error({
				reqId,
				msg: "User creation failed",
				user,
				extra: data,
			});
			throw new AuthServerError("Failed to create user account");
		}

		sendCode({
			reqId,
			kind: "verification",
			user,
		});

		logger.info({
			reqId,
			msg: "User Registration successful:)",
			user,
		});

		return { id: user.id };
	};

	const login: LoginType = async ({ password: passwd, email }) => {
		const reqId = genReqId();

		logger.trace({
			reqId,
			msg: "Starting Login",
			extra: { email },
		});

		const user = await findByEmail(email);

		const verifiedUser = userValidator.validateForPasswordAuth(
			user,
			{ reqId },
			"Invalid email or password",
		);

		logger.trace({
			reqId,
			msg: "Validating Password",
			extra: { userId: verifiedUser.id },
		});

		if (
			!(await validPassword({
				current: passwd,
				hash: verifiedUser.password as string,
			}))
		) {
			logger.error({
				reqId,
				msg: "Invalid password attempt",
				user: verifiedUser,
			});
			throw new AuthBadError("Invalid email or password");
		}

		const token = tokenHelper.signTokens(verifiedUser, reqId);

		logger.info({
			reqId,
			msg: "User Login successful:)",
			user: verifiedUser,
		});

		return {
			token,
			user: UserSanitizer.removePassword(verifiedUser),
		};
	};

	const startVerification: StartVerificationType = async ({ email }) => {
		const reqId = genReqId();

		logger.trace({
			reqId,
			msg: "Starting verification process",
			extra: {
				email,
			},
		});

		const user = await findByEmail(email);
		const verifiedUser = userValidator.validateForVerification(user, { reqId });

		logger.trace({
			reqId,
			msg: "Removing old verification codes",
			extra: { userId: verifiedUser.id },
		});
		await codeManager.remove(verifiedUser, reqId);

		sendCode({
			kind: "verification",
			reqId,
			user: verifiedUser,
		});

		return { id: verifiedUser.id };
	};

	const verifieAccount: VerifieAccountType = async ({ id, code }) => {
		const reqId = genReqId();

		logger.trace({
			reqId,
			msg: "Starting account verification",
			extra: { id },
		});

		await codeManager.verify({
			reqId,
			code,
			user: {
				id,
				email: "unknown",
				name: "unknown",
			},
		});

		const user = await updateById(id, {
			verifiedAt: new Date(),
		});

		if (!user) {
			logger.error({
				reqId,
				msg: "Failed to update user verification status",
				user,
			});
			throw new AuthBadError("Verification failed");
		}

		logger.trace({
			reqId,
			msg: "Removing verification code",
			extra: {
				userId: user.id,
			},
		});
		await codeManager.remove(user, reqId);

		const updatedUser = await findById(user.id);
		const verifiedUser = userValidator.validateExists(
			updatedUser,
			{ reqId },
			"Invalid Code",
		);

		const token = tokenHelper.signTokens(verifiedUser, reqId);

		logger.info({
			reqId,
			msg: "Account verification successful:)",
			user: verifiedUser,
		});

		return {
			token,
			user: UserSanitizer.removePassword(verifiedUser),
		};
	};

	const forgotPassword: ForgotPasswordType = async ({ email }) => {
		const reqId = genReqId();

		logger.trace({
			reqId,
			msg: "Processing forgot password request",
			extra: { email },
		});

		const user = await findByEmail(email);
		const verifiedUser = userValidator.validateForPasswordAuth(
			user,
			{ reqId },
			"Email is invalid!",
		);

		logger.trace({
			reqId,
			msg: "Checking for existing code",
			extra: { userId: verifiedUser.id },
		});

		const codeExists = await codeManager.checkExists(verifiedUser);

		if (codeExists) {
			logger.error({
				reqId,
				msg: "Too Many Requests",
				user: verifiedUser,
			});
			return { id: verifiedUser.id };
		}

		// TODO! clear session

		sendCode({
			reqId,
			kind: "forgot",
			user: verifiedUser,
		});

		return { id: verifiedUser.id };
	};

	const resetPassword: ResetPasswordType = async ({
		id,
		password: passwd,
		code,
	}) => {
		const reqId = genReqId();

		logger.trace({ reqId, msg: "Starting password reset", extra: { id } });

		await codeManager.verify({
			reqId,
			code,
			user: {
				id,
				email: "unknown",
				name: "unknown",
			},
		});
		await codeManager.remove(
			{
				id,
			},
			reqId,
		);

		logger.trace({ reqId, msg: "Hashing new Password", extra: { userId: id } });

		const password = await hashPassword(passwd);

		logger.trace({ reqId, msg: "Reseting user Password" });
		const user = await updateById(id, { password });

		if (!user) {
			logger.error({
				reqId,
				msg: "Failed to update user password",
				user,
			});
			throw new AuthBadError("Password reset failed");
		}

		const updatedUser = await findById(user.id);
		const verifiedUser = userValidator.validateExists(updatedUser, {
			reqId,
		});

		// TODO! clear session

		const token = tokenHelper.signTokens(verifiedUser, reqId);

		logger.info({
			reqId,
			msg: "Password reset successful:)",
			user: verifiedUser,
		});

		return {
			token,
			user: UserSanitizer.removePassword(verifiedUser),
		};
	};

	const checkAuth: CheckAuthType = async (req, reqId) => {
		if (!reqId) {
			reqId = genReqId();
		}

		logger.trace({ reqId, msg: "Checking authentication" });

		const [, token] = (extractToken.access(req) || "").split(" ");

		if (!token) {
			return { user: null };
		}

		const { user } = await verifyAndCheckBan({
			reqId,
			token,
			type: "access",
		});

		logger.info({
			reqId,
			msg: "Authentication check successful:)",
			user,
		});

		return { user: UserSanitizer.removePassword(user) };
	};

	const loginRequired: LoginRequiredType = async (req) => {
		const reqId = genReqId();

		const { user } = await checkAuth(req, reqId);

		if (!user) {
			logger.error({
				reqId,
				msg: "Authentication required but not provided",
				user,
			});
			throw new AuthNoTokenError();
		}

		return { user };
	};

	const tokenRefresh: TokenRefreshType = async (req) => {
		const reqId = genReqId();

		logger.trace({ reqId, msg: "Starting token refresh" });

		const [, token] = (extractToken.refresh(req) || "").split(" ");

		if (!token) {
			logger.error({
				reqId,
				msg: "Refresh token not provided",
				user: null,
			});
			throw new AuthNoTokenError();
		}

		const {
			token: { exp },
			user,
		} = await verifyAndCheckBan({
			reqId,
			token,
			type: "refresh",
		});

		const newTokens = tokenHelper.signTokens(user, reqId);

		// Refresh token rotation logic
		const shouldRotate = tokenHelper.shouldRotateRefreshToken(exp);

		if (!shouldRotate) {
			delete (newTokens as Partial<typeof newTokens>).refresh;
			logger.trace({ reqId, msg: "Refresh token still valid, not rotating" });
		} else {
			logger.trace({ reqId, msg: "Rotating refresh token" });
		}

		logger.info({
			reqId,
			msg: "Token refresh successful:)",
			user,
		});

		return {
			token: newTokens,
			user: UserSanitizer.removePassword(user),
		};
	};

	const logout: LogoutType = async (req) => {
		const reqId = genReqId();

		logger.trace({ reqId, msg: "Processing logout" });

		const [, accessToken] = (extractToken.access(req) || "").split(" ");
		const [, refreshToken] = (extractToken.refresh(req) || "").split(" ");

		const tokensToBan: Array<{ token: string; expirySeconds: number }> = [];

		if (accessToken) {
			logger.trace({ reqId, msg: "Access Token found Banning it" });
			tokensToBan.push({
				token: accessToken,
				expirySeconds: jwt.expires.access,
			});
		}

		if (refreshToken) {
			logger.trace({ reqId, msg: "Refresh Token found Banning it" });
			tokensToBan.push({
				token: refreshToken,
				expirySeconds: jwt.expires.refresh,
			});
		}

		if (tokensToBan.length > 0) {
			await tokenBanManager.banMultiple(tokensToBan, reqId);
			logger.trace({
				reqId,
				msg: "Tokens banned",
				extra: {
					count: tokensToBan.length,
				},
			});
		}

		logger.info({
			reqId,
			msg: "Logout successful",
			user: null,
		});
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
