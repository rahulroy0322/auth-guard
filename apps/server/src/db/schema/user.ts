import type { RoleType, UserType } from "base";
import {
	boolean,
	customType,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
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
	verifiedAt: timestamp("verified_at"),
	isBaned: boolean("is_baned").default(false).notNull(),

	...defaults,
}) satisfies { $inferSelect: Omit<UserType, "avatar" | "profiles"> };

export { User };
