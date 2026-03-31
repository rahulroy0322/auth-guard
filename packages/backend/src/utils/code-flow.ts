import type { SmartLogger } from "./smart-logger";
import type { CodeManager } from "./verification-code";

class CodeFlowHelper {
	constructor(
		private readonly logger: SmartLogger,
		private readonly code: CodeManager,
	) {}

	async verifyAndRemove(params: {
		userId: string;
		code: string;
		reqId: string;
	}) {
		const { userId, code, reqId } = params;

		await this.code.verify({
			reqId,
			code,
			user: { id: userId, email: "unknown", name: "unknown" },
		});

		this.logger.trace({ reqId, msg: "Removing verification code" });
		await this.code.remove({ id: userId }, reqId);
	}
}

export { CodeFlowHelper };
