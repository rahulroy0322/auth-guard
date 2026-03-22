import type { RoleType, UserType } from "base";
import { customType, pgTable, varchar } from "drizzle-orm/pg-core";
import { defaults } from "./helper";

const ROLES = (<const>[
	"super",
	"admin",
	"moderator",
	"editor",
	"user",
	"geast",
]) satisfies RoleType[];

const rolesType = customType<{
	data: RoleType[];
}>({
	dataType() {
		return "text";
	},
	toDriver: (value): string => {
		return JSON.stringify(value);
	},
	fromDriver: (value) => JSON.parse(value as string),
});

const User = pgTable("users", {
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 155 }).notNull().unique(),
	password: varchar("pass"),
	roles: rolesType({
		length: 15,
		enum: ROLES,
	})
		.default(["user"])
		.notNull(),
	...defaults,
}) satisfies { $inferSelect: UserType };

export { User };
