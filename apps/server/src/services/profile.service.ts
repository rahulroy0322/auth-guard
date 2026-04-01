import type { AuthPropsType } from "@auth-guard/express/types";
import type { ProfileType, ProviderType } from "base";
import { and, eq, type SQL } from "drizzle-orm";
import { db } from "../db/main";
import { Profile } from "../db/schema/profile";
import { checkNull } from "./utils";

type ProfileModelType = AuthPropsType<ProviderType>["Profile"];

const findProfiles = async ({
	filter = undefined,
	limit = undefined,
}: {
	filter?: SQL<unknown>;
	limit?: number;
}): Promise<ProfileType[]> =>
	await db.query.Profile.findMany({
		where: filter,
		columns: {
			email: true,
			provider: true,
			userId: true,
		},
		limit,
	});

const findByUserId: ProfileModelType["findByUserId"] = (userId) =>
	findProfiles({
		filter: checkNull({
			data: userId,
			key: Profile.userId,
		}),
	});

const create: ProfileModelType["create"] = async (data) => {
	const [profile = null] = await db.insert(Profile).values(data).returning();

	return profile;
};

const update: ProfileModelType["update"] = async (
	{ provider, userId },
	data,
) => {
	const [profile = null] = await db
		.update(Profile)
		.set(data)
		.where(and(eq(Profile.provider, provider), eq(Profile.userId, userId)))
		.returning();

	return profile;
};

export { create, findByUserId, update };
