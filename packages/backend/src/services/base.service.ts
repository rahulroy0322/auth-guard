import type { SmartLogger } from "../utils/smart-logger";

class BaseService {
	protected readonly logger: SmartLogger;
	constructor(logger: SmartLogger) {
		this.logger = logger;
	}
}

export { BaseService };
