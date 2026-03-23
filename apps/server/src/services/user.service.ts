import type { AuthPropsType } from "@auth-guard/express/types";
import type { UserType } from "base";
import { eq, isNull, type SQL, type TableConfig } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../db/main";
import { User } from "../db/schema/user";
import { Avatar } from "../db/schema/avatar";

type UserModelType = AuthPropsType["User"];

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
}): Promise<UserType[]> => {
	const users = await db.query.User.findMany({
		where: filter,
		columns: {
			id: true,
			email: true,
			name: true,
			password: true,
			roles: true,
			isBaned: true,
			isVerified: true,
		},
		with: {
			profiles: {
				columns: {
					email: true,
					provider: true,
				}
			},
			avatars: {
				limit: 1,
				where: eq(Avatar.active, true),
				columns: {
					src: true
				}
			}
		},
		limit,
	});

	return users.map((user) => ({
		...user,
		avatar: user.avatars.at(0) || null
	}))
}

const findByEmail: UserModelType["findByEmail"] = async (email) => {
	const [user = null] = await findUsers({
		limit: 1,
		filter: checkNull({
			data: email,
			key: "email",
			Table: User,
		}),
	});

	return user;
};

const findById: UserModelType["findById"] = async (id) => {
	const [user = null] = await findUsers({
		limit: 1,
		filter: eq(User.id, id),
	});

	return user;
};

const create: UserModelType["create"] = async (data) => {
	const [user = null] = await db.insert(User).values(data).returning();

	return user;
};

export { create, findByEmail, findById };
