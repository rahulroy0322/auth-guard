import type { MailConfigType, UserModelType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import type { UserValidator } from "../utils/user-validation";
import type { CodeManager } from "../utils/verification-code";
import { CodeService } from "./code.service";

class UserService extends CodeService {
	protected readonly User: UserModelType;
	protected readonly Validator: UserValidator;
	protected readonly Helper: TokenHelper;
	constructor({
		logger,
		User,
		Code,
		Mail,
		Validator,
		Helper,
	}: {
		logger: SmartLogger;
		User: UserModelType;
		Code: CodeManager;
		Mail: MailConfigType;
		Validator: UserValidator;
		Helper: TokenHelper;
	}) {
		super({
			logger,
			Code,
			Mail,
		});

		this.User = User;
		this.Validator = Validator;
		this.Helper = Helper;
	}
}

export { UserService };
