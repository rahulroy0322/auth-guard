import pino from "pino";
import { ENV, isDev } from "@/config/env.config";

const level: pino.LevelWithSilentOrString = process.env.LEBEL
	? ENV.LEBEL
	: isDev
		? "trace"
		: "info";

const targets: pino.TransportTargetOptions<Record<string, unknown>>[] = [];

if (isDev) {
	targets.push({
		level,
		target: "pino-pretty",
		options: {
			colorize: true,
			minimumLevel: level,
		},
	});
}

const logger = pino({
	level,
	...(targets.length
		? {
				transport: {
					targets,
				},
			}
		: {}),
	base: {
		processId: process.pid,
		appName: `<nextjs> Server`,
	},
	redact: {
		paths: [
			"password",
			"passwd",
			"pass",
			"user.password",
			"user.passwd",
			"user.pass",
		],
		censor: "[{HIDEN}]",
	},
	timestamp: pino.stdTimeFunctions.isoTime,
});

const { trace, debug, info, warn, error, fatal } = logger;

export { debug, error, fatal, info, logger, trace, warn };

export default logger;
