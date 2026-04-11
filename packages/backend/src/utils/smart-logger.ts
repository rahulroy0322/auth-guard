import type { LoggerType, LogType, UserType } from "../types";

type SmartLogData = Omit<LogType, "who" | "userId"> & {
	user: Pick<UserType, "email" | "id" | "name"> | null;
};

class SmartLogger {
	constructor(private readonly logger: LoggerType) {}

	private determineWho({ user }: Pick<SmartLogData, "user">): LogType["who"] {
		if (user) {
			if (user.name) {
				return user.name;
			}
			if (user.email) {
				return user.email;
			}
		}

		return "[SYSTEM]";
	}

	private determineUserId({ user }: Pick<SmartLogData, "user">): string | null {
		if (user) {
			if (user.id) {
				return user.id;
			}
		}

		return null;
	}

	private getLogData({ user, ...props }: SmartLogData): LogType {
		return {
			...props,
			userId: this.determineUserId({ user }),
			who: this.determineWho({ user }),
		};
	}

	info(data: SmartLogData): void {
		this.logger.info(this.getLogData(data));
	}

	error(data: SmartLogData): void {
		this.logger.error(this.getLogData(data));
	}

	warn(data: Omit<SmartLogData, "user">): void {
		this.logger.warn(
			this.getLogData({
				user: null,
				...data,
			}),
		);
	}

	trace(data: Omit<SmartLogData, "user">): void {
		this.logger.trace(
			this.getLogData({
				user: null,
				...data,
			}),
		);
	}
}

export type { SmartLogData };

export { SmartLogger };
