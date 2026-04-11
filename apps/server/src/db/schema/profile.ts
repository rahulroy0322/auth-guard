import type { ProfileType, ProviderType } from "@auth-guard/express/types";
import { pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core";
import { times } from "./helper";
import { User } from "./user";

const PROVIDERS = (<const>["google", "github"]) satisfies ProviderType[];

const Profile = pgTable(
	"profiles",
	{
		email: varchar({ length: 155 }).notNull(),
		provider: varchar({
			length: 15,
			enum: PROVIDERS,
		}).notNull(),
		userId: uuid()
			.references(() => User.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			})
			.notNull(),
		...times,
	},
	(table) => [
		primaryKey({
			columns: [table.userId, table.provider],
			name: "userId_provider_pk",
		}),
	],
) satisfies { $inferSelect: ProfileType };

export { Profile };
