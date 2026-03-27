import type {
	AvaterModelType,
	NewAvatarReturnType,
	NewAvatarType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
} from "../types";
import { genReqId } from "../utils/request-id";
import type { SmartLogger } from "../utils/smart-logger";
import { UserSanitizer } from "../utils/user-sanitizer";
import { BaseService } from "./base.service";
import type { SessionService } from "./session.service";

class AvaterService extends BaseService {
	private readonly avatar: AvaterModelType;
	private readonly session: SessionService;
	constructor({
		logger,
		avatar,
		session,
	}: {
		logger: SmartLogger;
		avatar: AvaterModelType;
		session: SessionService;
	}) {
		super(logger);
		this.avatar = avatar;
		this.session = session;
	}

	public newAvatar = async (
		req: Parameters<NewAvatarType>[0],
		{ url }: Parameters<NewAvatarType>[1],
	): Promise<NewAvatarReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting new avatar" });

		const { user } = await this.session.loginRequired(req);

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
			msg: "Createing new avatar",
		});
		const avatar = await this.avatar.create({
			active: true,
			src: url,
			userId: user.id,
		});

		this.logger.info({
			reqId,
			msg: "Avatar create successful",
			user,
		});
		return {
			user: UserSanitizer.removePassword({
				...user,
				avatar,
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
			msg: "Checking Avatar exist",
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
				this.logger.trace({
					reqId,
					msg: "Avatar  remove successful",
				});
			}
		}

		return {
			user: UserSanitizer.removePassword({
				...user,
				avatar,
			}),
		};
	};
}

export { AvaterService };
