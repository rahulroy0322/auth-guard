import type { IncomingMessage } from "node:http";
import type { JwtConfigType, TokenConfigType } from "../types";

class TokenExtractor {
	constructor(
		private readonly tokenConfig: TokenConfigType,
		private readonly jwtConfig: JwtConfigType,
	) {}

	public extractTokens = (req: IncomingMessage) => {
		const [, accessToken] = (this.tokenConfig.access(req) || "").split(" ");
		const [, refreshToken] = (this.tokenConfig.refresh(req) || "").split(" ");

		return { accessToken, refreshToken };
	};

	public prepareTokensForBan = (req: IncomingMessage) => {
		const { accessToken, refreshToken } = this.extractTokens(req);
		const tokens: Array<{
			token: string;
			expirySeconds: number;
		}> = [];

		if (accessToken) {
			tokens.push({
				token: accessToken,
				expirySeconds: this.jwtConfig.expires.access,
			});
		}

		if (refreshToken) {
			tokens.push({
				token: refreshToken,
				expirySeconds: this.jwtConfig.expires.refresh,
			});
		}

		return {
			tokens,
			accessToken,
			refreshToken,
		};
	};
}

export { TokenExtractor };
