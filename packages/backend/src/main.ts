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
	LogType,
	RegisterType,
	ResetPasswordType,
	StartVerificationType,
	TokenRefreshType,
	VerifieAccountType,
} from "./types";
import { hashPassword, validPassword } from "./utils/password";
import { genReqId } from "./utils/request-id";
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
	logger,
}) => {
	const tokenHelper = new TokenHelper(jwt, logger);
	const codeManager = new CodeManager(Cache, logger);
	const tokenBanManager = new TokenBanManager(Cache, logger);

	const log = (logData: LogType) => {
		logger.info(logData);
	};

	const logError = (logData: LogType) => {
		logger.error(logData);
	};

	const sendCode = async (props: Parameters<CodeManager["generate"]>[0]) => {
		const {
			reqId,
			user: { id: userId },
		} = props;
		const code = await codeManager.generate(props);

		logger.trace({ reqId, userId }, "Sending verification code via email");
		await sendMail(code);
		logger.trace({ reqId, userId }, "Verification code sent successfully");
	};

	const findUserAndCheckBan = async (
		userId: string,
		reqId: string,
	): Promise<UserType> => {
		logger.trace({ reqId, userId }, "Fetching user");

		const user = await findById(userId);
		UserValidator.validateExists(user);
		UserValidator.validateNotBanned(user);

		logger.trace({ reqId, userId }, "User fetched and validated");
		return user;
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

		logger.trace({ reqId, userId: token.id }, "Checking if token is banned");
		const isBanned = await tokenBanManager.isBanned(_token, reqId);

		if (isBanned) {
			logError({
				msg: "Banned token used",
				who: "[SYSTEM]",
				reqId,
				userId: token.id,
				extra: {
					token: _token,
				},
			});
			throw new AuthBadError("You have logged out previously");
		}

		const user = await findUserAndCheckBan(token.id, reqId);

		log({
			msg: "Token verified and user validated",
			userId: user.id,
			who: user.name,
			reqId,
		});

		return { user, token };
	};

	const register: RegisterType = async ({ password: passwd, ...data }) => {
		const reqId = genReqId();

		logger.trace({ ...data, reqId }, "Starting Registration");

		const existingUser = (await findByEmail(data.email)) ?? null;

		if (existingUser) {
			logError({
				msg: "Trying to Create Account Again",
				who: existingUser.name,
				userId: existingUser.id,
				reqId,
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

		if (!user) {
			logError({
				msg: "User creation failed",
				who: "[SYSTEM]",
				userId: null,
				reqId,
				extra: data,
			});
			throw new AuthServerError("Failed to create user account");
		}

		sendCode({
			reqId,
			kind: "verification",
			user,
		});

		log({
			msg: "User Registration successful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		return { id: user.id };
	};

	const login: LoginType = async ({ password: passwd, email }) => {
		const reqId = genReqId();

		logger.trace({ email, reqId }, "Starting Login");

		const user = await findByEmail(email);

		UserValidator.validateForPasswordAuth(user, "Invalid email or password");

		logger.trace({ reqId, userId: user.id }, "Validating Password");

		if (
			!(await validPassword({ current: passwd, hash: user.password as string }))
		) {
			logError({
				msg: "Invalid password attempt",
				who: user.name,
				userId: user.id,
				reqId,
			});
			throw new AuthBadError("Invalid email or password");
		}

		const token = tokenHelper.signTokens(user, reqId);

		log({
			msg: "User Login successful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		return {
			token,
			user: UserSanitizer.removePassword(user),
		};
	};

	const startVerification: StartVerificationType = async ({ email }) => {
		const reqId = genReqId();

		logger.trace({ email, reqId }, "Starting verification process");

		const user = await findByEmail(email);
		UserValidator.validateForVerification(user);

		logger.trace({ reqId, userId: user.id }, "Removing old verification codes");
		await codeManager.remove(user, reqId);

		sendCode({
			kind: "verification",
			reqId,
			user,
		});

		return { id: user.id };
	};

	const verifieAccount: VerifieAccountType = async ({ id, code }) => {
		const reqId = genReqId();

		logger.trace({ id, reqId }, "Starting account verification");

		await codeManager.verify({
			user: {
				id,
			},
			code,
			reqId,
		});

		const user = await updateById(id, {
			verifiedAt: new Date(),
		});

		if (!user) {
			logError({
				msg: "Failed to update user verification status",
				who: "[SYSTEM]",
				reqId,
				userId: id,
			});
			throw new AuthBadError("Verification failed");
		}

		logger.trace({ reqId, userId: user.id }, "Removing verification code");
		await codeManager.remove(user, reqId);

		const updatedUser = await findById(user.id);
		UserValidator.validateExists(updatedUser, "Invalid Code");

		const token = tokenHelper.signTokens(updatedUser, reqId);

		log({
			msg: "Account verification successful:)",
			userId: updatedUser.id,
			who: updatedUser.name,
			reqId,
		});

		return {
			token,
			user: UserSanitizer.removePassword(updatedUser),
		};
	};

	const forgotPassword: ForgotPasswordType = async ({ email }) => {
		const reqId = genReqId();

		logger.trace({ email, reqId }, "Processing forgot password request");

		const user = await findByEmail(email);
		UserValidator.validateForPasswordAuth(user, "Email is invalid!");

		logger.trace({ reqId, userId: user.id }, "Checking for existing code");
		const codeExists = await codeManager.checkExists(user);

		if (codeExists) {
			logError({
				msg: "Too Many Requests",
				who: "[SYSTEM]",
				reqId,
				userId: user.id,
			});
			return { id: user.id };
		}

		// TODO! clear session

		sendCode({
			reqId,
			kind: "forgot",
			user,
		});

		return { id: user.id };
	};

	const resetPassword: ResetPasswordType = async ({
		id,
		password: passwd,
		code,
	}) => {
		const reqId = genReqId();

		logger.trace({ id, reqId }, "Starting password reset");

		await codeManager.verify({
			user: {
				id,
			},
			code,
			reqId,
		});
		await codeManager.remove(
			{
				id,
			},
			reqId,
		);

		logger.trace({ reqId, userId: id }, "Hashing new Password");
		const password = await hashPassword(passwd);

		logger.trace({ reqId }, "Reseting user Password");
		const user = await updateById(id, { password });

		if (!user) {
			logError({
				msg: "Failed to update user password",
				who: "[SYSTEM]",
				reqId,
				userId: id,
			});
			throw new AuthBadError("Password reset failed");
		}

		const updatedUser = await findById(user.id);
		UserValidator.validateExists(updatedUser);

		// TODO! clear session

		const token = tokenHelper.signTokens(updatedUser, reqId);

		log({
			msg: "Password reset successful:)",
			userId: updatedUser.id,
			who: updatedUser.name,
			reqId,
		});

		return {
			token,
			user: UserSanitizer.removePassword(updatedUser),
		};
	};

	const checkAuth: CheckAuthType = async (req, reqId) => {
		if (!reqId) {
			reqId = genReqId();
		}

		logger.trace({ reqId }, "Checking authentication");

		const [, token] = (extractToken.access(req) || "").split(" ");

		if (!token) {
			return { user: null };
		}

		const { user } = await verifyAndCheckBan({
			reqId,
			token,
			type: "access",
		});

		log({
			msg: "Authentication check successful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		return { user: UserSanitizer.removePassword(user) };
	};

	const loginRequired: LoginRequiredType = async (req) => {
		const reqId = genReqId();

		const { user } = await checkAuth(req, reqId);

		if (!user) {
			logError({
				msg: "Authentication required but not provided",
				who: "[SYSTEM]",
				reqId,
				userId: null,
			});
			throw new AuthNoTokenError();
		}

		return { user };
	};

	const tokenRefresh: TokenRefreshType = async (req) => {
		const reqId = genReqId();

		logger.trace({ reqId }, "Starting token refresh");

		const [, token] = (extractToken.refresh(req) || "").split(" ");

		if (!token) {
			logError({
				msg: "Refresh token not provided",
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
			token,
			type: "refresh",
		});

		const newTokens = tokenHelper.signTokens(user, reqId);

		// Refresh token rotation logic
		const shouldRotate = tokenHelper.shouldRotateRefreshToken(exp);

		if (!shouldRotate) {
			delete (newTokens as Partial<typeof newTokens>).refresh;
			logger.trace(
				{ reqId, userId: user.id },
				"Refresh token still valid, not rotating",
			);
		} else {
			logger.trace({ reqId, userId: user.id }, "Rotating refresh token");
		}

		log({
			msg: "Token refresh successful:)",
			userId: user.id,
			who: user.name,
			reqId,
		});

		return {
			token: newTokens,
			user: UserSanitizer.removePassword(user),
		};
	};

	const logout: LogoutType = async (req) => {
		const reqId = genReqId();

		logger.trace({ reqId }, "Processing logout");

		const [, accessToken] = (extractToken.access(req) || "").split(" ");
		const [, refreshToken] = (extractToken.refresh(req) || "").split(" ");

		const tokensToBan: Array<{ token: string; expirySeconds: number }> = [];

		if (accessToken) {
			logger.trace({ reqId }, "Access Token found Banning it");
			tokensToBan.push({
				token: accessToken,
				expirySeconds: jwt.expires.access,
			});
		}

		if (refreshToken) {
			logger.trace({ reqId }, "Refresh Token found Banning it");
			tokensToBan.push({
				token: refreshToken,
				expirySeconds: jwt.expires.refresh,
			});
		}

		if (tokensToBan.length > 0) {
			await tokenBanManager.banMultiple(tokensToBan, reqId);
			logger.trace({ reqId, count: tokensToBan.length }, "Tokens banned");
		}

		log({
			msg: "Logout successful",
			userId: null,
			who: "[SYSTEM]",
			reqId,
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
