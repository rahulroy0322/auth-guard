import type { UserType } from "base";
import { nanoid } from "nanoid";
import { AuthBadError } from "../error";
import type { CacheConfigType } from "../types";
import { keys } from "./cache";
import type { SmartLogger } from "./smart-logger";

class CodeManager {
	private static readonly CODE_LENGTH = 6;
	private static readonly CODE_EXPIRY_SECONDS = 60 * 10;

	constructor(
		private readonly cache: CacheConfigType,
		private readonly logger: SmartLogger,
	) {}

	async generate({
		user,
		reqId,
		kind,
	}: {
		user: Pick<UserType, "id">;
		reqId: string;
		kind: "verification" | "forgot";
	}): Promise<string> {
		this.logger.trace({
			reqId,
			msg: `Generating code for "${kind} "` as const,
		});
		const code = nanoid().slice(4, 4 + CodeManager.CODE_LENGTH);
		this.logger.trace({
			reqId,
			msg: `Saving code for "${kind} "` as const,
		});

		await this.cache.set(
			keys.code(user),
			code,
			CodeManager.CODE_EXPIRY_SECONDS,
		);

		this.logger.trace({
			reqId,
			msg: "Code saved successfully",
		});

		return code;
	}

	async verify({
		code,
		reqId,
		user,
	}: {
		user: Pick<UserType, "id" | "email" | "name">;
		code: string;
		reqId: string;
	}): Promise<void> {
		this.logger.trace({
			msg: "Verifying code",
			reqId,
		});

		const cachedCode = await this.cache.get(keys.code(user));

		if (!cachedCode || cachedCode !== code) {
			this.logger.error({
				reqId,
				msg: "Code verification failed",
				user,
				extra: { providedCode: code, cachedCode },
			});

			throw new AuthBadError("Invalid or expired verification code");
		}

		this.logger.trace({
			reqId,
			msg: "Code verified successfully",
		});
	}

	async remove(user: Pick<UserType, "id">, reqId: string): Promise<void> {
		this.logger.trace({
			reqId,
			msg: "Removing verification code",
		});

		await this.cache.remove(keys.code(user));
	}

	async checkExists(user: Pick<UserType, "id">): Promise<boolean> {
		const code = await this.cache.get(keys.code(user));
		return code !== null;
	}
}

export { CodeManager };
