import type { CacheConfigType, CacheKeysType, SafeUserType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import { CacheModel } from "./base";

class UserCacheModel extends CacheModel<SafeUserType> {
	constructor(
		protected readonly key: CacheKeysType,
		protected readonly logger: SmartLogger,
		protected readonly model: {
			findById: (id: string) => Promise<SafeUserType | null>;
		},
		protected readonly cache: CacheConfigType,
		protected readonly CACHE = 60 * 60,
	) {
		super(key, logger, cache, CACHE);
	}

	public findById = async (id: string, { reqId }: { reqId: string }) =>
		this.getOrCache(id, () => this.model.findById(id), { reqId });
}

export { UserCacheModel };
