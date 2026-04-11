import type { SessionDBType } from "@auth-guard/express/types";
import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { defaults } from "./helper";
import { User } from "./user";

const Session = pgTable("sessions", {
	token: varchar({ length: 2048 }).notNull(),
	deviceId: varchar({ length: 255 }).notNull(),
	deviceType: varchar({ length: 255 }).notNull(),
	deviceName: varchar({ length: 255 }).notNull(),
	isActive: boolean().default(false).notNull(),
	userId: uuid()
		.references(() => User.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		})
		.notNull(),
	...defaults,
}) satisfies { $inferSelect: SessionDBType };

export { Session };
