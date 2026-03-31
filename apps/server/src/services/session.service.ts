import type { AuthPropsType } from "@auth-guard/express/types";
import type { SessionType } from "base";
import type { SQL } from "drizzle-orm";
import { db } from "../db/main";
import { Session } from "../db/schema/session";
import { checkNull } from "./utils";

type SessionModelType = AuthPropsType["Session"];

const findSessions = ({
	filter = undefined,
	limit = undefined,
}: {
	filter?: SQL<unknown>;
	limit?: number;
}): Promise<SessionType[]> =>
	db.query.Session.findMany({
		where: filter,
		columns: {
			id: true,
			userId: true,
			token: true,
			deviceId: true,
			deviceType: true,
			deviceName: true,
			isActive: true,
		},
		limit,
	});

const findByToken: SessionModelType["findByToken"] = async (token) => {
	const [session = null] = await findSessions({
		filter: checkNull({
			data: token,
			key: Session.token,
		}),
	});

	return session;
};
const create: SessionModelType["create"] = async (data) => {
	const [session = null] = await db.insert(Session).values(data).returning();

	return session;
};

const updateByToken: SessionModelType["updateByToken"] = async (
	token,
	data,
) => {
	const [session = null] = await db
		.update(Session)
		.set(data)
		.where(
			checkNull({
				data: token,
				key: Session.token,
			}),
		)
		.returning();

	return session;
};

const updateAllByUserId: SessionModelType["updateAllByUserId"] = async (
	userId,
	data,
) => {
	const _data = await db
		.update(Session)
		.set(data)
		.where(
			checkNull({
				data: userId,
				key: Session.userId,
			}),
		);

	return !!_data.rowCount;
};

export { create, findByToken, updateAllByUserId, updateByToken };
