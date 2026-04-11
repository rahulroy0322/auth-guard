import type {
	AuthPropsType,
	ProviderType,
	UserType,
} from "@auth-guard/express/types";
import { eq, type SQL } from "drizzle-orm";
import { db } from "../db/main";
import { User } from "../db/schema/user";
import { checkNull } from "./utils";

type UserModelType = AuthPropsType<ProviderType>["User"];

const findUsers = ({
	filter = undefined,
	limit = undefined,
}: {
	filter?: SQL<unknown>;
	limit?: number;
}): Promise<Omit<UserType, "profiles" | "avatar">[]> =>
	db.query.User.findMany({
		where: filter,
		columns: {
			id: true,
			email: true,
			name: true,
			password: true,
			roles: true,
			isBaned: true,
			verifiedAt: true,
		},
		limit,
	});

const findByEmail: UserModelType["findByEmail"] = async (email) => {
	const [user = null] = await findUsers({
		limit: 1,
		filter: checkNull({
			data: email,
			key: User.email,
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

	return user as unknown as UserType;
};

const updateById: UserModelType["updateById"] = async (id, data) => {
	const [user = null] = await db
		.update(User)
		.set(data as Partial<UserType>)
		.where(eq(User.id, id))
		.returning();

	return user;
};

export { create, findByEmail, findById, updateById };
