import type { ProfileType } from "../types";

type ProfileModelType = {
	findByUserId: (userId: ProfileType["userId"]) => Promise<ProfileType[]>;

	create: (data: ProfileType) => Promise<ProfileType | null>;

	update: (
		pk: Pick<ProfileType, "provider" | "userId">,
		data: Partial<ProfileType>,
	) => Promise<ProfileType | null>;
};

export type { ProfileModelType };
