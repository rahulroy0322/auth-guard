import type { IncomingMessage } from "node:http";
import type { SessionFormatedType } from "base";
import type { UserCacheModel } from "../cache/user";
import {
	AuthBadError,
	AuthNoTokenError,
	AuthUnAuthenticatedError,
} from "../error";
import type {
	AuthStatusReturnType,
	CheckAuthType,
	GetSessionsReturnType,
	GetSessionsType,
	LoginRequiredReturnType,
	LoginRequiredType,
	ReturnUserType,
	TokenConfigType,
	TokenRefreshReturnType,
} from "../types";
import type { SessionModelType } from "../types/session";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenBanManager } from "../utils/token-ban";
import type { TokenExtractor } from "../utils/token-extractor";
import type { TokenHelper } from "../utils/token-helpers";
import type { UserValidator } from "../utils/user-validation";
import type { UserService } from "./user.service";

class SessionService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly sessionModel: Pick<
			SessionModelType,
			"updateByToken" | "findByToken" | "findByUserId"
		>,
		private readonly userService: UserService,
		private readonly userCache: UserCacheModel,
		private readonly validator: UserValidator,
		private readonly helper: TokenHelper,
		private readonly tokenConfig: TokenConfigType,
		private readonly banManager: TokenBanManager,
		private readonly tokenExtractor: TokenExtractor,
	) {}

	public checkAuth = async (
		req: Parameters<CheckAuthType>[0],
		reqId?: Parameters<CheckAuthType>[1],
	): ReturnType<CheckAuthType> => {
		if (!reqId) {
			reqId = genReqId();
		}

		this.logger.trace({ reqId, msg: "Checking authentication" });

		const [, token] = ((await this.tokenConfig.access(req)) || "").split(" ");

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

		return { user };
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

		const [, token] = ((await this.tokenConfig.refresh(req)) || "").split(" ");

		if (!token) {
			this.logger.error({
				reqId,
				msg: "Refresh token not provided",
				user: null,
			});
			throw new AuthNoTokenError();
		}
		const session = await this.sessionModel.findByToken(token);
		if (!session || !session.isActive) {
			this.logger.error({
				reqId,
				msg: "You Are not logged in",
				user: null,
			});
			throw new AuthUnAuthenticatedError("You Are not logged in");
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
			msg: "Token refresh successful",
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

		const [, token] = ((await this.tokenConfig.refresh(req)) || "").split(" ");

		if (!token) {
			return {
				user: false,
			};
		}

		const session = await this.sessionModel.findByToken(token);
		if (!session || !session.isActive) {
			this.logger.error({
				reqId,
				msg: "You Are not logged in",
				user: null,
			});
			throw new AuthUnAuthenticatedError("You Are not logged in");
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
			msg: "Auth status successful",
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

		const { tokens: tokensToBan, refreshToken } =
			await this.tokenExtractor.prepareTokensForBan(req);

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

		if (refreshToken) {
			this.logger.trace({
				reqId,
				msg: "Refresh Token Found: inactiving",
			});
			const session = await this.sessionModel.updateByToken(refreshToken, {
				isActive: false,
			});
			if (!session) {
				this.logger.error({
					reqId,
					msg: "Session Update failed",
					user: null,
				});
			}
		}

		this.logger.info({
			reqId,
			msg: "Logout successful",
			user: null,
		});
	};

	public getSessions: GetSessionsType = async (
		req,
		{ deviceId },
	): Promise<GetSessionsReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting getSessions" });
		const { user } = await this.loginRequired(req);

		const sessions = await this.sessionModel.findByUserId(user.id);

		this.logger.info({
			reqId,
			msg: "Sessions fetch succesfully",
			user,
		});

		return {
			sessions: sessions.map(
				({ deviceId: dID, token, userId, ...session }) =>
					({
						...session,
						currentDevice: deviceId === dID,
					}) satisfies SessionFormatedType,
			),
		};
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

		return (
			await AuthResponseBuilder.buildUserResponse(verifiedUser, () =>
				this.userService.fetchUserWithRelations(verifiedUser.id, { reqId }),
			)
		).user;
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
