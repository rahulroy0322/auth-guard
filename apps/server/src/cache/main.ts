import { Redis } from "ioredis";
import ENV from "../config/env.config";
import logger from "../logger/pino";

// @ts-expect-error
const redis = new Redis(ENV.REDIS_URI, {
	tls: ENV.REDIS_URI.startsWith("rediss"),
	lazyConnect: true,
	autoResubscribe: true,
	reconnectOnError: true,
});

redis.on("error", (err) => {
	logger.error(err, `ERROR CACAHE CONNECT: `);
});

redis.on("connect", () => {
	logger.trace(`cache conected`);
});

redis.on("connecting", () => {
	logger.trace(`cache connecting...`);
});

redis.on("ready", () => {
	logger.trace(`cache is now ready...`);
});

const connectCache = () => {
	redis.connect();
	return redis;
};

const closeCache = () => {
	if (!redis) {
		return;
	}

	redis.disconnect(false);
};

export { closeCache, connectCache, redis };
