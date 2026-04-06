import type { AvatarType } from "base";
import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { defaults } from "./helper";
import { User } from "./user";

const Avatar = pgTable("avatars", {
	src: varchar({ length: 255 }).notNull(),
	active: boolean().default(false).notNull(),
	userId: uuid()
		.references(() => User.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		})
		.notNull(),
	...defaults,
}) satisfies { $inferSelect: AvatarType };

export { Avatar };
