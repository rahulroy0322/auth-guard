import type { IncomingMessage } from "node:http";
import type { JwtConfigType, TokenConfigType } from "../types";

class TokenExtractor {
	constructor(
		private readonly tokenConfig: TokenConfigType,
		private readonly jwtConfig: JwtConfigType,
	) {}

	public extractTokens = async (req: IncomingMessage) => {
		const [, accessToken] = ((await this.tokenConfig.access(req)) || "").split(
			" ",
		);
		const [, refreshToken] = (
			(await this.tokenConfig.refresh(req)) || ""
		).split(" ");

		return { accessToken, refreshToken };
	};

	public prepareTokensForBan = async (req: IncomingMessage) => {
		const { accessToken, refreshToken } = await this.extractTokens(req);
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
