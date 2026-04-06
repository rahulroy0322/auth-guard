import { timestamp, uuid } from "drizzle-orm/pg-core";

const times = {
	createdAt: timestamp("created_at", {
		mode: "string",
	})
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", {
		mode: "string",
	})
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date().toJSON()),
};

const defaults = {
	id: uuid("id").primaryKey().defaultRandom(),
	...times,
};

export { defaults, times };
