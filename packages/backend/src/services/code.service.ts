import type { MailConfigType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { CodeManager } from "../utils/verification-code";
import { BaseService } from "./base.service";

class CodeService extends BaseService {
	protected readonly code: CodeManager;
	protected readonly mail: MailConfigType;
	constructor({
		logger,
		code,
		mail,
	}: {
		logger: SmartLogger;
		code: CodeManager;
		mail: MailConfigType;
	}) {
		super(logger);
		this.code = code;
		this.mail = mail;
	}

	protected sendCode = async (
		props: Parameters<CodeManager["generate"]>[0],
	) => {
		const {
			reqId,
			user: { id: userId },
		} = props;
		const code = await this.code.generate(props);

		this.logger.trace({
			reqId,
			msg: "Sending verification code via email",
			extra: {
				userId,
			},
		});
		await this.mail.sendMail(code);
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
