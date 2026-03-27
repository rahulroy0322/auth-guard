import { AuthBadError } from "../error";
import type {
	ChangeNameReturnType,
	ChangeNameType,
	ChangePasswordReturnType,
	ChangePasswordType,
	JwtConfigType,
	TokenConfigType,
	UserModelType,
} from "../types";
import { hashPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenBanManager } from "../utils/token-ban";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import { BaseService } from "./base.service";
import type { SessionService } from "./session.service";

class ProfileService extends BaseService {
	private readonly User: UserModelType;
	private readonly Helper: TokenHelper;
	private readonly Session: SessionService;
	private readonly banManager: TokenBanManager;
	private readonly token: TokenConfigType;
	constructor(
		private readonly jwtConfig: JwtConfigType,
		{
			logger,
			User,
			Helper,
			Session,
			banManager,
			token,
		}: {
			logger: SmartLogger;
			User: UserModelType;
			Helper: TokenHelper;
			Session: SessionService;
			banManager: TokenBanManager;
			token: TokenConfigType;
		},
	) {
		super(logger);
		this.User = User;
		this.Helper = Helper;
		this.Session = Session;
		this.banManager = banManager;
		this.token = token;
	}

	public changePassword = async (
		req: Parameters<ChangePasswordType>[0],
		passwd: Parameters<ChangePasswordType>[1],
	): Promise<ChangePasswordReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting change password" });

		const { user } = await this.Session.loginRequired(req);

		this.logger.trace({
			reqId,
			msg: "Hashing new Password",
			extra: { userId: user.id },
		});
		const password = await hashPassword(passwd);

		this.logger.trace({ reqId, msg: "Changing user Password" });

		await this.User.updateById(user.id, { password });

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

		const token = this.Helper.signTokens(user, reqId);

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

	public changeName = async (
		req: Parameters<ChangeNameType>[0],
		name: Parameters<ChangeNameType>[1],
	): Promise<ChangeNameReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting change name" });

		const { user } = await this.Session.loginRequired(req);

		this.logger.trace({
			reqId,
			msg: "Updating user name",
			extra: { userId: user.id, newName: name },
		});

		const updated = await this.User.updateById(user.id, { name });

		if (!updated) {
			this.logger.error({
				reqId,
				msg: "Failed to update user name",
				user,
			});
			throw new AuthBadError("Name change failed");
		}

		const updatedUser = {
			...user,
			...updated,
		};

		this.logger.info({
			reqId,
			msg: "Name changed successful:)",
			user: updatedUser,
		});

		return {
			user: UserSanitizer.removePassword(updatedUser),
		};
	};
}

export { ProfileService };
