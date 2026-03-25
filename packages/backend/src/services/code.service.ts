import type { MailConfigType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { CodeManager } from "../utils/verification-code";
import { BaseService } from "./base.service";

class CodeService extends BaseService {
	protected readonly Code: CodeManager;
	protected readonly Mail: MailConfigType;
	constructor({
		logger,
		Code,
		Mail,
	}: {
		logger: SmartLogger;
		Code: CodeManager;
		Mail: MailConfigType;
	}) {
		super(logger);
		this.Code = Code;
		this.Mail = Mail;
	}

	protected sendCode = async (
		props: Parameters<CodeManager["generate"]>[0],
	) => {
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
	};
}

export { CodeService };
