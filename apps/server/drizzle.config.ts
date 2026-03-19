import { defineConfig } from "drizzle-kit";
import { DB_CONFIG } from "./src/config/env.config";

export default defineConfig({
	out: "./migrations",
	schema: "./src/db/schema/main.ts",
	dialect: "postgresql",
	dbCredentials: {
		...DB_CONFIG,
		ssl: false,
	},
});
