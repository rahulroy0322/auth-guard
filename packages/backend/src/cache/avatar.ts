import type { AvatarType, CacheConfigType, CacheKeysType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import { CacheModel } from "./base";

class AvatarCacheModel extends CacheModel<AvatarType> {
	constructor(
		protected readonly logger: SmartLogger,
		protected readonly key: CacheKeysType,
		protected readonly cache: CacheConfigType,
		private readonly model: {
			findByUserId: (userId: string) => Promise<AvatarType | null>;
		},
		protected readonly CACHE = 60 * 60,
	) {
		super(logger, key, cache, CACHE);
	}

	public findByUserId = async (id: string, { reqId }: { reqId: string }) =>
		this.getOrCache(id, () => this.model.findByUserId(id), { reqId });
}

export { AvatarCacheModel };
