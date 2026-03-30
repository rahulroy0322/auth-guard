import type { AvatarCacheModel } from "../cache/avatar";
import type { ProfileCacheModel } from "../cache/profile";
import { AuthBadError } from "../error";
import type {
	AvatarModelType,
	NewAvatarPropsType,
	NewAvatarReturnType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
} from "../types";
import { genReqId } from "../utils/request-id";
import type { SmartLogger } from "../utils/smart-logger";
import { UserSanitizer } from "../utils/user-sanitizer";
import { BaseService } from "./base.service";
import type { SessionService } from "./session.service";

class AvatarService extends BaseService {
	private readonly avatar: AvatarModelType;
	private readonly avatarCache: AvatarCacheModel;
	private readonly profileCache: ProfileCacheModel;
	private readonly session: SessionService;

	constructor({
		logger,
		avatar,
		avatarCache,
		profileCache,
		session,
	}: {
		logger: SmartLogger;
		avatar: AvatarModelType;
		avatarCache: AvatarCacheModel;
		profileCache: ProfileCacheModel;
		session: SessionService;
	}) {
		super(logger);
		this.avatar = avatar;
		this.avatarCache = avatarCache;
		this.profileCache = profileCache;
		this.session = session;
	}

	public newAvatar = async ({
		url,
		reqId,
		user,
	}: NewAvatarPropsType): Promise<NewAvatarReturnType> => {
		this.logger.trace({ reqId, msg: "Starting new avatar" });

		this.logger.trace({
			reqId,
			msg: "Checking prev Avatar",
		});
		const prevAvatar = await this.avatar.findActiveByUserId(user.id);

		if (prevAvatar) {
			this.logger.trace({
				reqId,
				msg: "Making inactive prev avatar",
			});
			await this.avatar.updateById(prevAvatar.id, {
				active: false,
			});
		}

		this.logger.trace({
			reqId,
			msg: "Creating new avatar",
		});
		const avatar = await this.avatar.create({
			active: true,
			src: url,
			userId: user.id,
		});
		if (!avatar) {
			this.logger.error({
				msg: "Failed to create avatar",
				reqId,
				user,
			});
			throw new AuthBadError("Failed to create avatar");
		}

		await this.avatarCache.cacheData(avatar.userId, avatar, { reqId });

		this.logger.info({
			reqId,
			msg: "Avatar create successful",
			user,
		});
		const profiles = await this.profileCache.findByUserId(user.id, {
			reqId,
		});

		return {
			user: UserSanitizer.removePassword({
				...user,
				avatar,
				profiles,
			}),
		};
	};

	public removeAvatar = async (
		req: Parameters<RemoveAvatarType>[0],
	): Promise<RemoveAvatarReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting remove avatar" });

		const { user } = await this.session.loginRequired(req);

		this.logger.trace({
			reqId,
			msg: "Checking Avatar exists",
		});
		const avatar = await this.avatar.findActiveByUserId(user.id);

		if (avatar) {
			this.logger.trace({
				reqId,
				msg: "Avatar exists removing it",
			});

			if (
				await this.avatar.updateById(avatar.id, {
					active: false,
				})
			) {
				this.avatarCache.destroyCacheData(avatar.userId, {
					reqId,
				});
				this.logger.trace({
					reqId,
					msg: "Avatar remove successful",
				});
			}
		}
		const profiles = await this.profileCache.findByUserId(user.id, {
			reqId,
		});

		return {
			user: UserSanitizer.removePassword({
				...user,
				avatar: null,
				profiles,
			}),
		};
	};
}

export { AvatarService };
