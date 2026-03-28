import type { AuthPropsType } from "@auth-guard/express/types";
import type { AvatarType } from "base";
import { and, eq, type SQL } from "drizzle-orm";
import { db } from "../db/main";
import { Avatar } from "../db/schema/avatar";
import { checkNull } from "./utils";

type AvatarModelType = AuthPropsType["Avatar"];

const findAvatars = async ({
	filter = undefined,
	limit = undefined,
}: {
	filter?: SQL<unknown>;
	limit?: number;
}): Promise<AvatarType[]> =>
	await db.query.Avatar.findMany({
		where: filter,
		columns: {
			id: true,
			active: true,
			src: true,
			userId: true,
		},
		limit,
	});

const findActiveByUserId: AvatarModelType["findActiveByUserId"] = async (
	userId,
) => {
	const [avatar = null] = await findAvatars({
		limit: 1,
		filter: and(
			checkNull({
				data: userId,
				key: Avatar.userId,
			}),
			eq(Avatar.active, true),
		),
	});

	return avatar;
};

const create: AvatarModelType["create"] = async (data) => {
	const [avatar = null] = await db.insert(Avatar).values(data).returning();

	return avatar;
};

const updateById: AvatarModelType["updateById"] = async (id, data) => {
	const [avatar = null] = await db
		.update(Avatar)
		.set(data)
		.where(eq(Avatar.id, id))
		.returning();

	return avatar;
};

export { create, findActiveByUserId, updateById };
