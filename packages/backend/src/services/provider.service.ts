import type { AvatarType } from "base";
import type { AvatarCacheModel } from "../cache/avatar";
import type { ProfileCacheModel } from "../cache/profile";
import type { UserCacheModel } from "../cache/user";
import { AuthServerError } from "../error";
import type { MailConfigType, UserModelType } from "../types";
import type {
	LoginWithProviderPropsType,
	LoginWithProviderReturnType,
	ProfileModelType,
} from "../types/profile";
import { genReqId } from "../utils/request-id";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { UserValidator } from "../utils/user-validation";
import type { CodeManager } from "../utils/verification-code";
import type { AvatarService } from "./avatar.service";
import { UserService } from "./user.service";

class ProviderService extends UserService {
	private readonly profile: Pick<ProfileModelType, "create">;
	private readonly avatar: AvatarService;

	constructor({
		logger,
		user,
		userCache,
		avatarCache,
		code,
		mail,
		validator,
		helper,
		profile,
		profileCache,
		avatar,
	}: {
		logger: SmartLogger;
		user: UserModelType;
		userCache: UserCacheModel;
		avatarCache: AvatarCacheModel;
		avatar: AvatarService;
		code: CodeManager;
		mail: MailConfigType;
		validator: UserValidator;
		helper: TokenHelper;
		profile: Pick<ProfileModelType, "create" | "findByUserId">;
		profileCache: ProfileCacheModel;
	}) {
		super({
			logger,
			code,
			mail,
			user,
			userCache,
			avatarCache,
			profileCache,
			validator,
			helper,
		});
		this.profile = profile;
		this.avatar = avatar;
	}

	public loginWithProvider = async ({
		email,
		avatarUrl,
		provider,
		name,
	}: LoginWithProviderPropsType): Promise<LoginWithProviderReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting Login with provider",
			extra: { email, provider },
		});

		let user = await this.user.findByEmail(email);

		if (!user) {
			this.logger.trace({
				reqId,
				msg: "Creating user",
			});
			user = await this.user.create({
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
				await this.avatar.newAvatar({
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
			const profile = await this.profile.create({
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

		this.logger.info({
			reqId,
			msg: "User Login with Provider successful",
			user: sanitizedUser,
		});

		return {
			user: {
				...sanitizedUser,
				avatar,
				profiles,
			},
			token,
		};
	};
}

export { ProviderService };
