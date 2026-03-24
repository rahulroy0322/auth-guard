import type { CacheConfigType } from "../types";
import { keys } from "./cache";
import type { SmartLogger } from "./smart-logger";

class TokenBanManager {
	constructor(
		private readonly cache: Pick<CacheConfigType, "get" | "set">,
		private readonly logger: SmartLogger,
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
		this.logger.trace({
			reqId,
			msg: "Banning token",
		});
		await this.cache.set(keys.token(token), token, expirySeconds);
		this.logger.trace({
			reqId,
			msg: "Token banned successfully",
		});
	}

	async isBanned(token: string, reqId: string): Promise<boolean> {
		this.logger.trace({
			reqId,
			msg: "Checking if token is banned",
		});
		const banned = await this.cache.get(keys.token(token));
		return !!banned;
	}

	async banMultiple(
		tokens: Array<{ token: string; expirySeconds: number }>,
		reqId: string,
	): Promise<void> {
		if (tokens.length === 0) return;

		this.logger.trace({
			reqId,
			msg: "Banning multiple tokens",
			extra: {
				count: tokens.length,
			},
		});

		await Promise.all(
			tokens.map(({ token, expirySeconds }) =>
				this.cache.set(keys.token(token), token, expirySeconds),
			),
		);

		this.logger.trace({
			reqId,
			msg: "All tokens banned successfully",
			extra: {
				count: tokens.length,
			},
		});
	}
}

export { TokenBanManager };
