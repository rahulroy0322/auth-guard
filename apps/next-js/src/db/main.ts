import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DB_CONFIG } from "@/config/db.config";
import { logger } from "@/logger/pino";
import * as schema from "./schema/main";

const client = new Pool(DB_CONFIG);

const db = drizzle({
	client,
	schema,
});

client.on("error", (err) => {
	logger.fatal(err, "ERROR DB CONNECT:");
	process.exit(1);
});

client.on("release", () => {
	globalThis.isConn = false;
});

client.on("connect", () => {
	logger.debug("db connected");
});

declare global {
	var isConn: boolean;
}

const connectDb = async (close = () => {}) => {
	try {
		if (!globalThis.isConn) {
			logger.trace("Connecting to db");
			await client.connect();
			globalThis.isConn = true;
		}
	} catch (error) {
		logger.fatal(error, "ERROR DB CONNECT:");
		close();
	}
};

export { connectDb, db };
