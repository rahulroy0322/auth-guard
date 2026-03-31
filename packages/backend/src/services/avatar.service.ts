import type { AvatarCacheModel } from "../cache/avatar";
import { AuthBadError } from "../error";
import type {
	AvatarModelType,
	NewAvatarPropsType,
	NewAvatarReturnType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
} from "../types";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { SessionService } from "./session.service";
import type { UserService } from "./user.service";

class AvatarService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly avatarModel: AvatarModelType,
		private readonly userService: UserService,
		private readonly sessionService: SessionService,
		private readonly avatarCache: AvatarCacheModel,
	) {}

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
		const prevAvatar = await this.avatarModel.findActiveByUserId(user.id);

		if (prevAvatar) {
			this.logger.trace({
				reqId,
				msg: "Making inactive prev avatar",
			});
			await this.avatarModel.updateById(prevAvatar.id, {
				active: false,
			});
		}

		this.logger.trace({
			reqId,
			msg: "Creating new avatar",
		});
		const avatar = await this.avatarModel.create({
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

		return AuthResponseBuilder.buildUserResponse(user, () =>
			this.userService.fetchUserWithRelations(user.id, { reqId }),
		);
	};

	public removeAvatar = async (
		req: Parameters<RemoveAvatarType>[0],
	): Promise<RemoveAvatarReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting remove avatar" });

		const { user } = await this.sessionService.loginRequired(req);

		this.logger.trace({
			reqId,
			msg: "Checking Avatar exists",
		});
		const avatar = await this.avatarModel.findActiveByUserId(user.id);

		if (avatar) {
			this.logger.trace({
				reqId,
				msg: "Avatar exists removing it",
			});

			if (
				await this.avatarModel.updateById(avatar.id, {
					active: false,
				})
			) {
				await this.avatarCache.destroyCacheData(avatar.userId, {
					reqId,
				});
				this.logger.trace({
					reqId,
					msg: "Avatar remove successful",
				});
			}
		}

		return await AuthResponseBuilder.buildUserResponse(user, () =>
			this.userService.fetchUserWithRelations(user.id, { reqId }),
		);
	};
}

export { AvatarService };
