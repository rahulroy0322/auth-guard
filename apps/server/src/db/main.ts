import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DB_CONFIG } from "../config/env.config";
import { logger } from "../logger/pino";
import * as schema from "./schema/main";

const client = new Pool(DB_CONFIG);

const db = drizzle({
	client,
	schema,
});

client.on("error", (err) => {
	logger.fatal(err, `ERROR DB CONNECT: `);
	process.exit(1);
});

client.on("connect", () => {
	logger.debug(`db conected`);
});

const connectDb = async (close = () => {}) => {
	try {
		await client.connect();
	} catch (e) {
		logger.fatal(e, `ERROR DB CONNECT: `);
		close();
	}
};

const closeDb = client.end;

export { closeDb, connectDb, db };
