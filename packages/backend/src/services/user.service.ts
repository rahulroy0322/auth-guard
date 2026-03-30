import type { CacheModel } from "../cache.model";
import type { MailConfigType, SafeUserType, UserModelType } from "../types";
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
	protected readonly userCache: CacheModel<SafeUserType>;
	protected readonly validator: UserValidator;
	protected readonly helper: TokenHelper;
	constructor({
		logger,
		user,
		userCache,
		code,
		mail,
		validator,
		helper,
	}: {
		logger: SmartLogger;
		user: UserModelType;
		userCache: CacheModel<SafeUserType>;
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
		this.validator = validator;
		this.helper = helper;
	}
}

export { UserService };
