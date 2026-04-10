import "server-only";
import { ENV } from "./env.config";

const DB_CONFIG = {
	host: ENV.DB_HOST,
	user: ENV.DB_USER,
	password: ENV.DB_PASSWORD,
	database: ENV.DB_DATABASE,
	ssl: ENV.DB_HOST !== "localhost",
};

export { DB_CONFIG };
