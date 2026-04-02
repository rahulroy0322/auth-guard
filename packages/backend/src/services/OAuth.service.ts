import type { ProviderType } from "base";
import type { ProfileCacheModel } from "../cache/profile";
import type { UserCacheModel } from "../cache/user";
import { AuthInvalidCodeError, AuthServerError } from "../error";
import type { OAuth } from "../OAuth/base";
import type { UserModelType } from "../types";
import type { OAuthLoginType, OAuthStartType } from "../types/OAuth";
import type { ProfileModelType } from "../types/profile";
import type { SessionModelType } from "../types/session";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { AvatarService } from "./avatar.service";
import type { UserService } from "./user.service";

class OAuthService<T extends ProviderType> {
	constructor(
		private readonly logger: SmartLogger,
		private readonly userModel: Pick<UserModelType, "create" | "findByEmail">,
		private readonly profileModel: Pick<ProfileModelType, "create">,
		private readonly sessionModel: Pick<SessionModelType, "create">,
		private readonly userService: UserService,
		private readonly avatarService: AvatarService,
		private readonly userCache: UserCacheModel,
		private readonly profileCache: ProfileCacheModel,
		private readonly helper: TokenHelper,
		private readonly clients: Partial<Record<T, OAuth<unknown>>>,
	) {}

	private getClient = ({ provider, reqId }: { provider: T; reqId: string }) => {
		const client = this.clients[provider];
		if (!client) {
			this.logger.error({
				reqId,
				msg: "Invalid provider => May be developer forget to configure",
				user: null,
			});
			throw new AuthServerError("Invalid provider");
		}

		return client;
	};

	public oAuthStart: OAuthStartType<T> = (provider) => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting oAuthStart",
			extra: { provider },
		});

		const client = this.getClient({
			provider,
			reqId,
		});
		const { url, state, codeVerifier } = client.createLoginURL();

		return {
			url: url.toString(),
			state,
			codeVerifier,
		};
	};

	public login: OAuthLoginType<T> = async (
		query,
		{
			provider,
			deviceId,
			deviceName,
			deviceType,
			state: expectedState,
			codeVerifier,
		},
	) => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting Login with provider",
			extra: { provider },
		});

		const code = query.code;
		const state = query.state;

		if (typeof code !== "string" || typeof state !== "string") {
			throw new AuthInvalidCodeError();
		}

		const client = this.getClient({
			provider,
			reqId,
		});

		const { email, name, avatarUrl } = await client.fetchUser(
			code,
			{
				expected: expectedState,
				got: state,
			},
			codeVerifier,
		);

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
			if (avatarUrl) {
				await this.avatarService.newAvatar({
					url: avatarUrl,
					reqId,
					user,
				});
			}
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

		return AuthResponseBuilder.buildAuthResponse(user, token, async () =>
			this.userService.fetchUserWithRelations(user.id, {
				reqId,
			}),
		);
	};
}

export { OAuthService };
