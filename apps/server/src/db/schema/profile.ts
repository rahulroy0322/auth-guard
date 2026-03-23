import type { ProfileType, ProviderType } from "base";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { times } from "./helper";
import { uuid } from "drizzle-orm/pg-core";
import { User } from "./user";
import { primaryKey } from "drizzle-orm/pg-core";

const PROVIDERS = (<const>[
	'google', 'github'
]) satisfies ProviderType[];

const Profile = pgTable("profiles", {
	email: varchar({ length: 155 }).notNull(),
	provider: varchar({
		length: 15,
		enum: PROVIDERS,
	}).notNull(),
	userId: uuid().references(() => User.id, {
		onDelete: 'cascade',
		onUpdate:'cascade'
	}).notNull(),
	...times,
	// TODO! add userid provide pk
}, (table) => [
	primaryKey({
		columns: [table.userId, table.provider],
		name: "userId_provider_pk"
	})
]) satisfies { $inferSelect: ProfileType };

export { Profile };
