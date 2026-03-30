import type { IncomingMessage } from "node:http";
import type { AvatarCacheModel } from "../cache/avatar";
import type { UserCacheModel } from "../cache/user";
import { AuthBadError, AuthNoTokenError } from "../error";
import type {
	AuthStatusReturnType,
	CheckAuthType,
	JwtConfigType,
	LoginRequiredReturnType,
	LoginRequiredType,
	ReturnUserType,
	TokenConfigType,
	TokenRefreshReturnType,
} from "../types";
import { genReqId } from "../utils/request-id";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenBanManager } from "../utils/token-ban";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { UserValidator } from "../utils/user-validation";
import { BaseService } from "./base.service";

class SessionService extends BaseService {
	private readonly userCache: UserCacheModel;
	private readonly avatarCache: AvatarCacheModel;
	private readonly validator: UserValidator;
	private readonly helper: TokenHelper;
	private readonly token: TokenConfigType;
	private readonly banManager: TokenBanManager;

	constructor(
		private readonly jwtConfig: JwtConfigType,
		{
			logger,
			userCache,
			avatarCache,
			validator,
			helper,
			token,
			banManager,
		}: {
			logger: SmartLogger;
			userCache: UserCacheModel;
			avatarCache: AvatarCacheModel;
			validator: UserValidator;
			helper: TokenHelper;
			token: TokenConfigType;
			banManager: TokenBanManager;
		},
	) {
		super(logger);

		this.userCache = userCache;
		this.avatarCache = avatarCache;
		this.validator = validator;
		this.helper = helper;
		this.token = token;
		this.banManager = banManager;
	}

	public checkAuth = async (
		req: Parameters<CheckAuthType>[0],
		reqId?: Parameters<CheckAuthType>[1],
	): ReturnType<CheckAuthType> => {
		if (!reqId) {
			reqId = genReqId();
		}

		this.logger.trace({ reqId, msg: "Checking authentication" });

		const [, token] = (this.token.access(req) || "").split(" ");

		if (!token) {
			return { user: null };
		}

		const { user } = await this.verifyAndCheckBan({
			reqId,
			token,
			type: "access",
		});

		this.logger.info({
			reqId,
			msg: "Authentication check successful:)",
			user,
		});

		return { user: UserSanitizer.removePassword(user) };
	};

	public loginRequired = async (
		req: Parameters<LoginRequiredType>[0],
		{ reqId }: Parameters<LoginRequiredType>[1] = {},
	): Promise<LoginRequiredReturnType> => {
		if (!reqId) {
			reqId = genReqId();
		}

		const { user } = await this.checkAuth(req, reqId);

		if (!user) {
			this.logger.error({
				reqId,
				msg: "Authentication required but not provided",
				user,
			});
			throw new AuthNoTokenError();
		}

		return { user };
	};

	public tokenRefresh = async (
		req: IncomingMessage,
	): Promise<TokenRefreshReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting token refresh" });

		const [, token] = (this.token.refresh(req) || "").split(" ");

		if (!token) {
			this.logger.error({
				reqId,
				msg: "Refresh token not provided",
				user: null,
			});
			throw new AuthNoTokenError();
		}

		const {
			token: { exp },
			user,
		} = await this.verifyAndCheckBan({
			reqId,
			token,
			type: "refresh",
		});

		const newTokens = this.helper.signTokens(user, reqId);

		const shouldRotate = this.helper.shouldRotateRefreshToken(exp);

		if (!shouldRotate) {
			delete (newTokens as Partial<typeof newTokens>).refresh;
			this.logger.trace({
				reqId,
				msg: "Refresh token still valid, not rotating",
			});
		} else {
			this.logger.trace({ reqId, msg: "Rotating refresh token" });
		}

		this.logger.info({
			reqId,
			msg: "Token refresh successful:)",
			user,
		});

		return {
			token: newTokens,
			user,
		};
	};

	public authStatus = async (
		req: IncomingMessage,
	): Promise<AuthStatusReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting Auth Status" });

		const [, token] = (this.token.refresh(req) || "").split(" ");

		if (!token) {
			return {
				user: false,
			};
		}

		const {
			token: { exp },
			user,
		} = await this.verifyAndCheckBan({
			reqId,
			token,
			type: "refresh",
		});

		const newTokens = this.helper.signTokens(user, reqId);

		const shouldRotate = this.helper.shouldRotateRefreshToken(exp);

		if (!shouldRotate) {
			delete (newTokens as Partial<typeof newTokens>).refresh;
			this.logger.trace({
				reqId,
				msg: "Refresh token still valid, not rotating",
			});
		} else {
			this.logger.trace({ reqId, msg: "Rotating refresh token" });
		}

		this.logger.info({
			reqId,
			msg: "Auth status successful:)",
			user,
		});

		return {
			token: newTokens,
			user,
		};
	};

	public logout = async (req: IncomingMessage): Promise<void> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Processing logout" });

		const [, accessToken] = (this.token.access(req) || "").split(" ");
		const [, refreshToken] = (this.token.refresh(req) || "").split(" ");

		const tokensToBan: Array<{ token: string; expirySeconds: number }> = [];

		if (accessToken) {
			this.logger.trace({ reqId, msg: "Access Token found Banning it" });
			tokensToBan.push({
				token: accessToken,
				expirySeconds: this.jwtConfig.expires.access,
			});
		}

		if (refreshToken) {
			this.logger.trace({ reqId, msg: "Refresh Token found Banning it" });
			tokensToBan.push({
				token: refreshToken,
				expirySeconds: this.jwtConfig.expires.refresh,
			});
		}

		if (tokensToBan.length > 0) {
			await this.banManager.banMultiple(tokensToBan, reqId);
			this.logger.trace({
				reqId,
				msg: "Tokens banned",
				extra: {
					count: tokensToBan.length,
				},
			});
		}

		this.logger.info({
			reqId,
			msg: "Logout successful",
			user: null,
		});
	};

	private findUserAndCheckBan = async (
		userId: string,
		reqId: string,
	): Promise<ReturnUserType> => {
		this.logger.trace({ reqId, extra: { userId }, msg: "Fetching user" });

		const user = await this.userCache.findById(userId, {
			reqId,
		});
		const verifiedUser = this.validator.validateExists(user, {
			reqId,
		});
		this.validator.validateNotBanned(verifiedUser, { reqId });

		const sanitizedUser = UserSanitizer.removePassword(verifiedUser);

		const avatar = await this.avatarCache.findByUserId(sanitizedUser.id, {
			reqId,
		});

		return {
			...sanitizedUser,
			avatar,
			// TODO!
			profiles: [],
		};
	};

	private verifyAndCheckBan = async ({
		token: _token,
		type: reqType,
		reqId,
	}: {
		token: string;
		type: "access" | "refresh";
		reqId: string;
	}): Promise<{
		user: ReturnUserType;
		token: ReturnType<TokenHelper["verifyAndDecode"]>;
	}> => {
		const token = this.helper.verifyAndDecode({
			reqId,
			token: _token,
			expectedType: reqType,
		});

		this.logger.trace({
			reqId,
			extra: { token },
			msg: "Checking if token is banned",
		});
		const isBanned = await this.banManager.isBanned(_token, reqId);

		if (isBanned) {
			this.logger.error({
				reqId,
				msg: "Banned token used",
				user: null,
				extra: {
					token: _token,
				},
			});
			throw new AuthBadError("You have logged out previously");
		}

		const user = await this.findUserAndCheckBan(token.id, reqId);

		this.logger.info({
			reqId,
			msg: "Token verified and user validated",
			user,
		});

		return { user, token };
	};
}

export { SessionService };
