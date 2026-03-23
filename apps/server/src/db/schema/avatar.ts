import type { AvatarType } from "base";
import { eq } from "drizzle-orm";
import {
	boolean,
	pgTable,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { defaults } from "./helper";
import { User } from "./user";

const Avatar = pgTable(
	"avatars",
	{
		src: varchar({ length: 255 }).notNull(),
		active: boolean().default(false).notNull(),
		userId: uuid()
			.references(() => User.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			})
			.notNull(),
		...defaults,
	},
	(table) => [
		uniqueIndex("one_active_avatar_per_user")
			.on(table.userId)
			.where(eq(table.active, true)),
	],
) satisfies { $inferSelect: AvatarType };

export { Avatar };
