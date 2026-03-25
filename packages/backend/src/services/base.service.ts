import type { MailConfigType, TokenConfigType, UserModelType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenBanManager } from "../utils/token-ban";
import type { TokenHelper } from "../utils/token-helpers";
import type { UserValidator } from "../utils/user-validation";
import type { CodeManager } from "../utils/verification-code";

type BaseServicePropsType = {
	logger: SmartLogger;
	User: UserModelType;
	Code: CodeManager;
	Mail: MailConfigType;
	Validator: UserValidator;
	Helper: TokenHelper;
	Token: TokenConfigType;
	BanManager: TokenBanManager;
};

class BaseService {
	protected readonly logger: SmartLogger;
	protected readonly User: UserModelType;
	protected readonly Code: CodeManager;
	protected readonly Mail: MailConfigType;
	protected readonly Validator: UserValidator;
	protected readonly Helper: TokenHelper;
	protected readonly Token: TokenConfigType;
	protected readonly BanManager: TokenBanManager;
	constructor({
		logger,
		User,
		Code,
		Mail,
		Validator,
		Helper,
		Token,
		BanManager,
	}: BaseServicePropsType) {
		this.logger = logger;
		this.User = User;
		this.Code = Code;
		this.Mail = Mail;
		this.Validator = Validator;
		this.Helper = Helper;
		this.Token = Token;
		this.BanManager = BanManager;
	}

	protected async sendCode(props: Parameters<CodeManager["generate"]>[0]) {
		const {
			reqId,
			user: { id: userId },
		} = props;
		const code = await this.Code.generate(props);

		this.logger.trace({
			reqId,
			msg: "Sending verification code via email",
			extra: {
				userId,
			},
		});
		await this.Mail.sendMail(code);
		this.logger.trace({
			reqId,
			msg: "Verification code sent successfully",
			extra: {
				userId,
			},
		});
	}
}

export type { BaseServicePropsType };

export { BaseService };
