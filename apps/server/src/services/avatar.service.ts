import type { AuthPropsType } from "@auth-guard/express/types";
import type { AvatarType } from "base";
import { and, eq, isNull, type SQL, type TableConfig } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../db/main";
import { Avatar } from "../db/schema/avatar";

type AvatarModelType = AuthPropsType["Avatar"];

const checkNull = <T extends PgTable<TableConfig>>({
	data,
	key,
	Table,
}: {
	data: null | unknown;
	key: keyof T;
	Table: T;
}) => {
	if (!data) {
		return isNull(
			// @ts-expect-error
			Table[key],
		);
	}
	return eq(
		// @ts-expect-error
		Table[key],
		data,
	);
};

const findUsers = async ({
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
	const [user = null] = await findUsers({
		limit: 1,
		filter: and(
			checkNull({
				data: userId,
				key: "userId",
				Table: Avatar,
			}),
			eq(Avatar.active, true),
		),
	});

	return user;
};

const create: AvatarModelType["create"] = async (data) => {
	const [user = null] = await db.insert(Avatar).values(data).returning();

	return user;
};

const updateById: AvatarModelType["updateById"] = async (id, data) => {
	const [user = null] = await db
		.update(Avatar)
		.set(data)
		.where(eq(Avatar.id, id))
		.returning();

	return user;
};

export { create, findActiveByUserId, updateById };
