import type { AvatarCacheModel } from "../cache/avatar";
import type { UserCacheModel } from "../cache/user";
import { AuthBadError } from "../error";
import type {
	ChangePasswordReturnType,
	ChangePasswordType,
	JwtConfigType,
	TokenConfigType,
	UpdateProfileReturnType,
	UpdateProfileType,
	UserModelType,
} from "../types";
import { hashPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenBanManager } from "../utils/token-ban";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { AvatarService } from "./avatar.service";
import type { SessionService } from "./session.service";
import type { UserService } from "./user.service";

class ProfileService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly userModel: Pick<UserModelType, "updateById">,
		private readonly userService: UserService,
		private readonly avatarService: AvatarService,
		private readonly sessionService: SessionService,
		private readonly userCache: UserCacheModel,
		private readonly avatarCache: AvatarCacheModel,
		private readonly helper: TokenHelper,
		private readonly tokenConfig: TokenConfigType,
		private readonly jwtConfig: JwtConfigType,
		private readonly banManager: TokenBanManager,
	) {}

	public changePassword = async (
		req: Parameters<ChangePasswordType>[0],
		passwd: Parameters<ChangePasswordType>[1],
	): Promise<ChangePasswordReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting change password" });

		const { user } = await this.sessionService.loginRequired(req);

		this.logger.trace({
			reqId,
			msg: "Hashing new Password",
			extra: { userId: user.id },
		});
		const password = await hashPassword(passwd);

		this.logger.trace({ reqId, msg: "Changing user Password" });

		await this.userModel.updateById(user.id, { password });

		this.logger.trace({ reqId, msg: "Extracting tokens to ban" });
		const [, accessToken] = (this.tokenConfig.access(req) || "").split(" ");
		const [, refreshToken] = (this.tokenConfig.refresh(req) || "").split(" ");

		const tokensToBan: Array<{ token: string; expirySeconds: number }> = [];

		if (accessToken) {
			this.logger.trace({ reqId, msg: "Access Token found Banning it" });
			tokensToBan.push({
				token: accessToken,
				expirySeconds: this.jwtConfig.expires.access,
			});
		}

		if (refreshToken) {
			this.logger.trace({ reqId, msg: "Refresh Token found Banning it" });
			tokensToBan.push({
				token: refreshToken,
				expirySeconds: this.jwtConfig.expires.refresh,
			});
		}

		this.banManager.banMultiple(tokensToBan, reqId);

		const token = this.helper.signTokens(user, reqId);

		this.logger.info({
			reqId,
			msg: "Password changed successful:)",
			user,
		});

		return AuthResponseBuilder.buildAuthResponse(user, token, () =>
			this.userService.fetchUserWithRelations(user.id, { reqId }),
		);
	};

	public updateProfile = async (
		req: Parameters<UpdateProfileType>[0],
		{ name, url, id }: Parameters<UpdateProfileType>[1],
	): Promise<UpdateProfileReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting update profile" });

		if (!name && !id && !url) {
			throw new AuthBadError("Give Something to update");
		}

		const { user } = await this.sessionService.loginRequired(req, { reqId });

		let avatar = user.avatar;

		if (url) {
			avatar = (
				await this.avatarService.newAvatar({
					url,
					reqId,
					user,
				})
			).user.avatar;
		}
		// ! impl else if(id){}

		if (name) {
			this.logger.trace({ reqId, msg: "Update name" });
			const updated = await this.userModel.updateById(user.id, {
				name,
			});
			if (updated) {
				this.userCache.cacheData(
					user.id,
					UserSanitizer.removePassword({
						...user,
						...updated,
					}),
					{
						reqId,
					},
				);
			}
		}

		this.logger.info({
			reqId,
			msg: "Profile Update successful",
			user: user,
		});

		if (!avatar) {
			await this.avatarCache.destroyCacheData(user.id, {
				reqId,
			});
		}

		return AuthResponseBuilder.buildUserResponse(user, () =>
			this.userService.fetchUserWithRelations(user.id, { reqId }),
		);
	};
}

export { ProfileService };
