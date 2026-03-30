import type { CacheConfigType, CacheKeysType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";

class CacheModel<T extends Record<string, unknown>> {
	constructor(
		protected readonly key: CacheKeysType,
		protected readonly logger: SmartLogger,
		protected readonly cache: CacheConfigType,
		protected readonly CACHE = 60 * 60,
	) {}

	protected getKey = (id: string) => `${this.key}:${id}` as const;

	public destroyCacheData = (id: string, { reqId }: { reqId: string }) => {
		this.logger.trace({
			reqId,
			msg: `Destroy data for "${this.key}"` as const,
			extra: { id },
		});
		return this.cache.remove(this.getKey(id));
	};

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

	public getOrCache = async (
		id: string,
		cb: () => Promise<T | null>,
		{ reqId }: { reqId: string },
	) => {
		this.logger.trace({
			reqId,
			msg: `Checking cache for "${this.key}"` as const,
			extra: { id },
		});

		const cached = await this.cache.get(this.getKey(id));
		if (cached) {
			this.logger.trace({
				reqId,
				msg: "Cache Found",
				extra: { id },
			});
			try {
				return JSON.parse(cached) as T;
			} catch (error) {
				this.logger.warn({
					reqId,
					msg: "Failed to parse cached data, falling back to DB.",
					extra: { id, error },
				});
			}
		}

		this.logger.trace({
			reqId,
			msg: "Cache Miss, quering db",
		});
		const data = await cb();

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
