import type { CacheConfigType, LoggerType } from "../types";
import { keys } from "./cache";

class TokenBanManager {
	constructor(
		private cache: Pick<CacheConfigType, "get" | "set">,
		private logger: LoggerType,
	) {}

	async ban({
		token,
		expirySeconds,
		reqId,
	}: {
		token: string;
		expirySeconds: number;
		reqId: string;
	}): Promise<void> {
		this.logger.trace({ reqId }, "Banning token");
		await this.cache.set(keys.token(token), token, expirySeconds);
		this.logger.trace({ reqId }, "Token banned successfully");
	}

	async isBanned(token: string, reqId: string): Promise<boolean> {
		this.logger.trace({ reqId }, "Checking if token is banned");
		const banned = await this.cache.get(keys.token(token));
		return !!banned;
	}

	async banMultiple(
		tokens: Array<{ token: string; expirySeconds: number }>,
		reqId: string,
	): Promise<void> {
		if (tokens.length === 0) return;

		this.logger.trace(
			{ reqId, count: tokens.length },
			"Banning multiple tokens",
		);

		await Promise.all(
			tokens.map(({ token, expirySeconds }) =>
				this.cache.set(keys.token(token), token, expirySeconds),
			),
		);

		this.logger.trace({ reqId }, "All tokens banned successfully");
	}
}

export { TokenBanManager };
