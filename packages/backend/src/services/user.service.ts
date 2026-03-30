import type { AvatarCacheModel } from "../cache/avatar";
import type { UserCacheModel } from "../cache/user";
import type { MailConfigType, UserModelType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import type { UserValidator } from "../utils/user-validation";
import type { CodeManager } from "../utils/verification-code";
import { CodeService } from "./code.service";

class UserService extends CodeService {
	protected readonly user: Pick<
		UserModelType,
		"create" | "findByEmail" | "updateById"
	>;
	protected readonly userCache: UserCacheModel;
	protected readonly avatarCache: AvatarCacheModel;
	protected readonly validator: UserValidator;
	protected readonly helper: TokenHelper;
	constructor({
		logger,
		user,
		userCache,
		avatarCache,
		code,
		mail,
		validator,
		helper,
	}: {
		logger: SmartLogger;
		user: UserModelType;
		userCache: UserCacheModel;
		avatarCache: AvatarCacheModel;
		code: CodeManager;
		mail: MailConfigType;
		validator: UserValidator;
		helper: TokenHelper;
	}) {
		super({
			logger,
			code,
			mail,
		});

		this.user = user;
		this.userCache = userCache;
		this.avatarCache = avatarCache;
		this.validator = validator;
		this.helper = helper;
	}
}

export { UserService };
