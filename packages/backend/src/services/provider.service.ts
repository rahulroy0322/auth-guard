import type { AvatarType } from "base";
import type { ProfileCacheModel } from "../cache/profile";
import type { UserCacheModel } from "../cache/user";
import { AuthServerError } from "../error";
import type { UserModelType } from "../types";
import type {
	LoginWithProviderPropsType,
	LoginWithProviderReturnType,
	ProfileModelType,
} from "../types/profile";
import type { SessionModelType } from "../types/session";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { AvatarService } from "./avatar.service";

class ProviderService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly userModel: Pick<UserModelType, "create" | "findByEmail">,
		private readonly profileModel: Pick<ProfileModelType, "create">,
		private readonly sessionModel: Pick<SessionModelType, "create">,
		private readonly avatarService: AvatarService,
		private readonly userCache: UserCacheModel,
		private readonly profileCache: ProfileCacheModel,
		private readonly helper: TokenHelper,
	) {}

	public loginWithProvider = async ({
		email,
		avatarUrl,
		provider,
		name,
		deviceId,
		deviceName,
		deviceType,
	}: LoginWithProviderPropsType): Promise<LoginWithProviderReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting Login with provider",
			extra: { email, provider },
		});

		let user = await this.userModel.findByEmail(email);

		if (!user) {
			this.logger.trace({
				reqId,
				msg: "Creating user",
			});
			user = await this.userModel.create({
				email,
				name,
				roles: ["user"],
				verifiedAt: new Date(),
			});
			if (!user) {
				this.logger.error({
					reqId,
					msg: "User Create failed",
					user,
				});
				throw new AuthServerError("User Create failed");
			}
		}

		let avatar: AvatarType | null = null;

		if (avatarUrl) {
			avatar = (
				await this.avatarService.newAvatar({
					url: avatarUrl,
					user,
					reqId,
				})
			).user.avatar as AvatarType;
		}

		const profiles = await this.profileCache.findByUserId(user.id, {
			reqId,
		});

		if (!profiles.find((profile) => profile.provider === provider)) {
			this.logger.trace({
				reqId,
				msg: "Creating Profile",
			});
			const profile = await this.profileModel.create({
				email,
				provider,
				userId: user.id,
			});
			if (!profile) {
				this.logger.error({
					reqId,
					msg: "Profile Create failed",
					user,
				});
				throw new AuthServerError("Failed to create profile");
			}
			profiles.push(profile);
		}

		const sanitizedUser = UserSanitizer.removePassword(user);
		await this.userCache.cacheData(user.id, sanitizedUser, { reqId });
		await this.profileCache.cacheData(user.id, profiles, {
			reqId,
		});

		const token = this.helper.signTokens(user, reqId);

		const session = await this.sessionModel.create({
			token: token.refresh,
			userId: user.id,
			isActive: true,
			deviceId,
			deviceName,
			deviceType,
		});
		if (!session) {
			this.logger.error({
				reqId,
				msg: "Session Create failed",
				user,
			});
			throw new AuthServerError("Session Create failed");
		}

		this.logger.info({
			reqId,
			msg: "User Login with Provider successful",
			user: sanitizedUser,
		});

		return AuthResponseBuilder.buildAuthResponse(user, token, async () => ({
			avatar,
			profiles,
		}));
	};
}

export { ProviderService };
