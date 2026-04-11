import type { SessionType } from "@auth-guard/types";

type SessionModelType = {
	findByToken: (token: SessionType["token"]) => Promise<SessionType | null>;
	findByUserId: (userId: SessionType["userId"]) => Promise<SessionType[]>;

	create: (
		data: Omit<SessionType, "createdAt" | "id">,
	) => Promise<SessionType | null>;

	updateByToken: (
		token: SessionType["token"],
		data: Partial<Omit<SessionType, "createdAt" | "id" | "userId">>,
	) => Promise<SessionType | null>;

	updateAllByUserId: (
		userId: SessionType["userId"],
		data: Partial<Omit<SessionType, "createdAt" | "id" | "userId">>,
	) => Promise<boolean>;
};

export type { SessionModelType };
