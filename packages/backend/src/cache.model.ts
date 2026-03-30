import type { CacheConfigType, CacheKeysType } from "./types";
import type { SmartLogger } from "./utils/smart-logger";

class CacheModel<T extends Record<string, unknown>> {
	constructor(
		private readonly key: CacheKeysType,
		private readonly logger: SmartLogger,
		private readonly model: { findById: (id: string) => Promise<T | null> },
		private readonly cache: Pick<CacheConfigType, "get" | "set">,
		private readonly CACHE = 60 * 60,
	) {}

	public cacheData = (id: string, data: T, { reqId }: { reqId: string }) => {
		this.logger.trace({
			reqId,
			msg: `Cache Data for "${this.key}"` as const,
			extra: { id },
		});
		return this.cache.set(
			`${this.key}:${id}`,
			JSON.stringify(data),
			this.CACHE,
		);
	};

	public findById = async (id: string, { reqId }: { reqId: string }) => {
		this.logger.trace({
			reqId,
			msg: `Chacking cache for "${this.key}"` as const,
			extra: { id },
		});
		const cached = await this.cache.get(`${this.key}:${id}`);
		if (cached) {
			this.logger.trace({
				reqId,
				msg: "Cache Found",
				extra: { id },
			});
			return JSON.parse(cached) as T;
		}

		this.logger.trace({
			reqId,
			msg: "Cache Miss, quering db",
		});
		const data = await this.model.findById(id);

		if (!data) {
			this.logger.trace({
				reqId,
				msg: "Not Found in db",
			});
			return null;
		}

		await this.cacheData(id, data, { reqId });

		return data;
	};
}

export { CacheModel };
