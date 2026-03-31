import type { MailConfigType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { CodeManager } from "../utils/verification-code";

class CodeService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly code: CodeManager,
		private readonly mail: MailConfigType,
	) {}

	public sendCode = async (props: Parameters<CodeManager["generate"]>[0]) => {
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
