import type { CacheModel } from "../cache/base";
import { AuthBadError } from "../error";
import type {
	ChangePasswordReturnType,
	ChangePasswordType,
	JwtConfigType,
	SafeUserType,
	TokenConfigType,
	UpdateProfileReturnType,
	UpdateProfileType,
	UserModelType,
} from "../types";
import { hashPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenBanManager } from "../utils/token-ban";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { AvatarService } from "./avatar.service";
import { BaseService } from "./base.service";
import type { SessionService } from "./session.service";

class ProfileService extends BaseService {
	private readonly user: Pick<UserModelType, "updateById">;
	private readonly userCache: CacheModel<SafeUserType>;
	private readonly helper: TokenHelper;
	private readonly session: SessionService;
	private readonly avatar: AvatarService;

	private readonly banManager: TokenBanManager;
	private readonly token: TokenConfigType;
	constructor(
		private readonly jwtConfig: JwtConfigType,
		{
			logger,
			user,
			userCache,
			helper,
			session,
			avatar,
			banManager,
			token,
		}: {
			logger: SmartLogger;
			user: UserModelType;
			userCache: CacheModel<SafeUserType>;
			helper: TokenHelper;
			session: SessionService;
			avatar: AvatarService;
			banManager: TokenBanManager;
			token: TokenConfigType;
		},
	) {
		super(logger);
		this.user = user;
		this.userCache = userCache;
		this.helper = helper;
		this.session = session;
		this.avatar = avatar;
		this.banManager = banManager;
		this.token = token;
	}

	public changePassword = async (
		req: Parameters<ChangePasswordType>[0],
		passwd: Parameters<ChangePasswordType>[1],
	): Promise<ChangePasswordReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting change password" });

		const { user } = await this.session.loginRequired(req);

		this.logger.trace({
			reqId,
			msg: "Hashing new Password",
			extra: { userId: user.id },
		});
		const password = await hashPassword(passwd);

		this.logger.trace({ reqId, msg: "Changing user Password" });

		await this.user.updateById(user.id, { password });

		this.logger.trace({ reqId, msg: "Extracting tokens to ban" });
		const [, accessToken] = (this.token.access(req) || "").split(" ");
		const [, refreshToken] = (this.token.refresh(req) || "").split(" ");

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

		return {
			token,
			user: UserSanitizer.removePassword(user),
		};
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

		const { user } = await this.session.loginRequired(req, { reqId });

		let avatar = user.avatar;

		if (url) {
			avatar = (
				await this.avatar.newAvatar({
					url,
					reqId,
					user,
				})
			).user.avatar;
		}
		// ! impl else if(id){}

		if (name) {
			this.logger.trace({ reqId, msg: "Update name" });
			const updated = await this.user.updateById(user.id, {
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

		return {
			user: UserSanitizer.removePassword({
				...user,
				name: name || user.name,
				avatar,
				// TODO!
				profiles: [],
			}),
		};
	};
}

export { ProfileService };
