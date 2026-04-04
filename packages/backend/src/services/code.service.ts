import type { MailConfigType, SafeUserType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";
import type { CodeManager } from "../utils/verification-code";

class CodeService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly code: CodeManager,
		private readonly mail: MailConfigType,
	) {}

	public sendCode = async (
		props: Omit<Parameters<CodeManager["generate"]>[0], "user"> & {
			user: Pick<SafeUserType, "id" | "email">;
		},
	) => {
		const {
			reqId,
			user: { id: userId, email },
			kind,
		} = props;
		const code = await this.code.generate(props);

		this.logger.trace({
			reqId,
			msg: `Sending "${kind}" code via email` as const,
			extra: {
				userId,
			},
		});
		await this.mail.sendMail({
			type: kind,
			code,
			email,
		});
		this.logger.trace({
			reqId,
			msg: `Code "${kind}" sent successfully` as const,
			extra: {
				userId,
			},
		});
	};
}

export { CodeService };
