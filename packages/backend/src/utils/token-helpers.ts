import type { UserType } from "base";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AuthError, AuthExpiredError, AuthWrongTokenError } from "../error";
import type { JwtConfigType, LoggerType, TokenType } from "../types";
import { signToken, verifyToken } from "./token";

class TokenHelper {
	constructor(
		private jwt: JwtConfigType,
		private logger: LoggerType,
	) {}

	signTokens(user: Pick<UserType, "id" | "name">, reqId: string) {
		this.logger.trace({ reqId, userId: user.id }, "Creating tokens");

		const refresh = signToken(
			{ id: user.id, type: "refresh" },
			this.jwt.secret,
			{ expiresIn: this.jwt.expires.refresh },
		);

		const access = signToken({ id: user.id, type: "access" }, this.jwt.secret, {
			expiresIn: this.jwt.expires.access,
		});

		this.logger.trace(
			{ reqId, userId: user.id },
			"Tokens created successfully",
		);

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
			this.logger.trace({ reqId }, "Verifying token");

			const decoded = verifyToken(token, this.jwt.secret);

			if (decoded.type !== expectedType) {
				this.logger.error(
					{
						msg: "Wrong token type provided",
						who: "[SYSTEM]",
						reqId,
						userId: decoded.id,
						extra: { expected: expectedType, got: decoded.type },
					},
					"Token type mismatch",
				);
				throw new AuthWrongTokenError();
			}

			this.logger.trace(
				{ reqId, userId: decoded.id },
				"Token verified successfully",
			);

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
