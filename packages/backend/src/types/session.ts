import type { SessionType } from "base";

type SessionModelType = {
	findByToken: (token: SessionType["token"]) => Promise<SessionType | null>;

	create: (data: Omit<SessionType, "id">) => Promise<SessionType | null>;

	updateByToken: (
		token: SessionType["token"],
		data: Partial<SessionType>,
	) => Promise<SessionType | null>;

	updateAllByUserId: (
		userId: SessionType["userId"],
		data: Partial<SessionType>,
	) => Promise<boolean>;
};

export type { SessionModelType };
