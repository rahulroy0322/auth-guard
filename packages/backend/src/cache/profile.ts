import type { ProfileType } from "base";
import type { CacheConfigType, CacheKeysType } from "../types";
import type { ProfileModelType } from "../types/profile";
import type { SmartLogger } from "../utils/smart-logger";
import { CacheModel } from "./base";

class ProfileCacheModel extends CacheModel<ProfileType[]> {
	constructor(
		protected readonly key: CacheKeysType,
		protected readonly logger: SmartLogger,
		protected readonly model: Pick<ProfileModelType, "findByUserId">,
		protected readonly cache: CacheConfigType,
		protected readonly CACHE = 60 * 60,
	) {
		super(key, logger, cache, CACHE);
	}

	public findByUserId = async (id: string, { reqId }: { reqId: string }) =>
		this.getOrCache(id, () => this.model.findByUserId(id), {
			reqId,
		}) as unknown as ProfileType[];
}

export { ProfileCacheModel };
