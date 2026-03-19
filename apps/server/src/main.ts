import { isDev, PORT } from "./config/env.config";
import { closeDb, connectDb } from "./db/main";
import http from "./http";
import logger from "./logger/pino";

const close = async () => {
	if (!server.listening || isDev) {
		process.exit(0);
	}

	await Promise.all([
		server.closeIdleConnections(),
		server.closeAllConnections(),
		closeDb(),
		// closeCache(),
	]);
	server.close((err) => {
		if (err) {
			logger.error(err, "ERROR! in server close");
			process.exit(1);
		}
		process.exit(0);
	});
};

const server = http.listen(PORT, () => {
	logger.debug(`SERVER app is running on port : ${PORT}`);
	connectDb(close);
	//   connectCache()
});

process.once("SIGINT", close).once("SIGTERM", close);
