import type { CacheConfigType, CacheKeysType, SafeUserType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { AvatarCacheModel } from "./avatar";
import { CacheModel } from "./base";
import type { ProfileCacheModel } from "./profile";

class UserCacheModel extends CacheModel<SafeUserType> {
	constructor(
		protected readonly logger: SmartLogger,
		protected readonly key: CacheKeysType,
		protected readonly cache: CacheConfigType,
		private readonly model: {
			findById: (id: string) => Promise<SafeUserType | null>;
		},
		private readonly avatarCache: AvatarCacheModel,
		private readonly profileCache: ProfileCacheModel,
		protected readonly CACHE = 60 * 60,
	) {
		super(logger, key, cache, CACHE);
	}

	public invalidateUserCache = (userId: string, reqId: string) =>
		Promise.all([
			this.destroyCacheData(userId, { reqId }),
			this.avatarCache.destroyCacheData(userId, { reqId }),
			this.profileCache.destroyCacheData(userId, { reqId }),
		]);

	public findById = async (id: string, { reqId }: { reqId: string }) =>
		this.getOrCache(
			id,
			async () => {
				const user = await this.model.findById(id);

				if (!user) {
					return null;
				}

				return UserSanitizer.removePassword(user);
			},
			{ reqId },
		);
}

export { UserCacheModel };
