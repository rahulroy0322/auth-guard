import type { AuthPropsType, UserType } from "@auth-guard/express/types";
import { eq, isNull, type SQL, type TableConfig } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../db/main";
import { User } from "../db/schema/user";

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

const findUsers = ({
	filter = undefined,
	limit = undefined,
}: {
	filter?: SQL<unknown>;
	limit?: number;
}): Promise<UserType[]> =>
	db.query.User.findMany({
		where: filter,
		columns: {
			id: true,
			email: true,
			name: true,
			pass: true,
			roles: true,
		},
		limit,
	});

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
