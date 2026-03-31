import type { AvatarCacheModel } from "../cache/avatar";
import type { ProfileCacheModel } from "../cache/profile";

class UserService {
	constructor(
		private readonly avatarCache: AvatarCacheModel,
		private readonly profileCache: ProfileCacheModel,
	) {}

	public fetchUserWithRelations = async (
		userId: string,
		{ reqId }: { reqId: string },
	) => {
		const avatar = await this.avatarCache.findByUserId(userId, { reqId });
		const profiles = await this.profileCache.findByUserId(userId, { reqId });
		return { avatar, profiles };
	};
}

export { UserService };
