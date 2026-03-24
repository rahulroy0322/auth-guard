import type { UserType } from "base";
import { nanoid } from "nanoid";
import { AuthBadError } from "../error";
import type { CacheConfigType, LoggerType } from "../types";
import { keys } from "./cache";

class CodeManager {
	private static CODE_LENGTH = 6;
	private static CODE_EXPIRY_SECONDS = 60 * 10;

	constructor(
		private cache: CacheConfigType,
		private logger: LoggerType,
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
		this.logger.trace(
			{ reqId, userId: user.id },
			`Generating code for "${kind} "`,
		);

		const code = nanoid().slice(4, 4 + CodeManager.CODE_LENGTH);

		this.logger.trace({ reqId }, `Saving code for "${kind} "`);
		await this.cache.set(
			keys.code(user),
			code,
			CodeManager.CODE_EXPIRY_SECONDS,
		);

		this.logger.trace({ reqId }, "Code saved successfully");

		return code;
	}

	async verify({
		code,
		reqId,
		user,
	}: {
		user: Pick<UserType, "id">;
		code: string;
		reqId: string;
	}): Promise<void> {
		this.logger.trace({ reqId, user }, "Verifying code");

		const cachedCode = await this.cache.get(keys.code(user));

		if (!cachedCode || cachedCode !== code) {
			this.logger.error(
				{
					msg: "Code verification failed",
					who: "[SYSTEM]",
					reqId,
					userId: user.id,
					extra: { providedCode: code, cachedCode },
				},
				"Invalid or expired verification code",
			);
			throw new AuthBadError("Invalid or expired verification code");
		}

		this.logger.trace({ reqId, userId: user.id }, "Code verified successfully");
	}

	async remove(user: Pick<UserType, "id">, reqId: string): Promise<void> {
		this.logger.trace({ reqId, userId: user.id }, "Removing verification code");
		await this.cache.remove(keys.code(user));
	}

	async checkExists(user: Pick<UserType, "id">): Promise<boolean> {
		const code = await this.cache.get(keys.code(user));
		return code !== null;
	}
}

export { CodeManager };
