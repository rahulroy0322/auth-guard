import type { AvatarType } from "base";
import type { CacheConfigType, CacheKeysType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import { CacheModel } from "./base";

class AvatarCacheModel extends CacheModel<AvatarType> {
	constructor(
		protected readonly key: CacheKeysType,
		protected readonly logger: SmartLogger,
		protected readonly model: {
			findByUserId: (id: string) => Promise<AvatarType | null>;
		},
		protected readonly cache: CacheConfigType,
		protected readonly CACHE = 60 * 60,
	) {
		super(key, logger, cache, CACHE);
	}

	public findByUserId = async (id: string, { reqId }: { reqId: string }) =>
		this.getOrCache(id, () => this.model.findByUserId(id), { reqId });
}

export { AvatarCacheModel };
