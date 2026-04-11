import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AuthError, AuthExpiredError, AuthWrongTokenError } from "../error";
import type { JwtConfigType, TokenType, UserType } from "../types";
import type { SmartLogger } from "./smart-logger";
import { signToken, verifyToken } from "./token";

class TokenHelper {
	constructor(
		private readonly logger: SmartLogger,
		private readonly jwt: JwtConfigType,
	) {}

	signTokens(user: Pick<UserType, "id">, reqId: string) {
		this.logger.trace({
			reqId,
			msg: "Creating tokens",
		});

		const refresh = signToken(
			{ id: user.id, type: "refresh" },
			this.jwt.secret,
			{ expiresIn: this.jwt.expires.refresh },
		);

		const access = signToken({ id: user.id, type: "access" }, this.jwt.secret, {
			expiresIn: this.jwt.expires.access,
		});

		this.logger.trace({
			reqId,
			msg: "Tokens created successfully",
		});

		return {
			refresh,
			access,
		};
	}

	verifyAndDecode({
		token,
		expectedType,
		reqId,
	}: {
		token: string;
		expectedType: TokenType["type"];
		reqId: string;
	}) {
		try {
			this.logger.trace({
				reqId,
				msg: "Verifying token",
			});

			const decoded = verifyToken(token, this.jwt.secret);

			if (decoded.type !== expectedType) {
				this.logger.error({
					msg: "Wrong token type provided",
					reqId,
					user: {
						id: decoded.id,
						email: "Unknown",
						name: "Unknown",
					},
					extra: { expected: expectedType, got: decoded.type },
				});
				throw new AuthWrongTokenError();
			}

			this.logger.trace({
				reqId,
				msg: "Token verified successfully",
			});

			return decoded;
		} catch (e) {
			if (e instanceof TokenExpiredError) {
				throw new AuthExpiredError();
			}

			if (e instanceof AuthError || e instanceof JsonWebTokenError) {
				throw e;
			}

			throw new AuthError((e as Error).message);
		}
	}

	shouldRotateRefreshToken(exp: number): boolean {
		const ROTATION_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
		const tokenExpiresAt = exp * 1000;
		return tokenExpiresAt - Date.now() < ROTATION_THRESHOLD_MS;
	}
}

export { TokenHelper };
