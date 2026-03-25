import type { IncomingMessage } from "node:http";
import type { UserType } from "base";
import { AuthBadError, AuthNoTokenError } from "../error";
import type {
	CheckAuthType,
	JwtConfigType,
	LoginRequiredReturnType,
	TokenRefreshReturnType,
} from "../types";
import { genReqId } from "../utils/request-id";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import { BaseService, type BaseServicePropsType } from "./base.service";

class SessionService extends BaseService {
	private readonly JWTConfig: JwtConfigType;
	constructor(props: BaseServicePropsType, JWTConfig: JwtConfigType) {
		super(props);
		this.JWTConfig = JWTConfig;
	}

	public async checkAuth(
		req: Parameters<CheckAuthType>[0],
		reqId: Parameters<CheckAuthType>[1],
	): ReturnType<CheckAuthType> {
		if (!reqId) {
			reqId = genReqId();
		}

		this.logger.trace({ reqId, msg: "Checking authentication" });

		const [, token] = (this.Token.access(req) || "").split(" ");

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
	}

	public async loginRequired(
		req: IncomingMessage,
	): Promise<LoginRequiredReturnType> {
		const reqId = genReqId();

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
	}

	public async tokenRefresh(
		req: IncomingMessage,
	): Promise<TokenRefreshReturnType> {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting token refresh" });

		const [, token] = (this.Token.refresh(req) || "").split(" ");

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

		const newTokens = this.Helper.signTokens(user, reqId);

		const shouldRotate = this.Helper.shouldRotateRefreshToken(exp);

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
			user: UserSanitizer.removePassword(user),
		};
	}

	public async logout(req: IncomingMessage): Promise<void> {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Processing logout" });

		const [, accessToken] = (this.Token.access(req) || "").split(" ");
		const [, refreshToken] = (this.Token.refresh(req) || "").split(" ");

		const tokensToBan: Array<{ token: string; expirySeconds: number }> = [];

		if (accessToken) {
			this.logger.trace({ reqId, msg: "Access Token found Banning it" });
			tokensToBan.push({
				token: accessToken,
				expirySeconds: this.JWTConfig.expires.access,
			});
		}

		if (refreshToken) {
			this.logger.trace({ reqId, msg: "Refresh Token found Banning it" });
			tokensToBan.push({
				token: refreshToken,
				expirySeconds: this.JWTConfig.expires.refresh,
			});
		}

		if (tokensToBan.length > 0) {
			await this.BanManager.banMultiple(tokensToBan, reqId);
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
	}

	private async findUserAndCheckBan(
		userId: string,
		reqId: string,
	): Promise<UserType> {
		this.logger.trace({ reqId, extra: { userId }, msg: "Fetching user" });

		const user = await this.User.findById(userId);
		const verifiedUser = this.Validator.validateExists(user, {
			reqId,
		});
		this.Validator.validateNotBanned(verifiedUser, { reqId });

		return verifiedUser;
	}

	private async verifyAndCheckBan({
		token: _token,
		type: reqType,
		reqId,
	}: {
		token: string;
		type: "access" | "refresh";
		reqId: string;
	}): Promise<{
		user: UserType;
		token: ReturnType<TokenHelper["verifyAndDecode"]>;
	}> {
		const token = this.Helper.verifyAndDecode({
			reqId,
			token: _token,
			expectedType: reqType,
		});

		this.logger.trace({
			reqId,
			extra: { token },
			msg: "Checking if token is banned",
		});
		const isBanned = await this.BanManager.isBanned(_token, reqId);

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
	}
}

export { SessionService };
