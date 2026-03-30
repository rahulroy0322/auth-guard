import type { UserType } from "base";

type LogType = {
	who: "[SYSTEM]" | (UserType["name"] & {});
	userId: UserType["id"] | null;
	msg: Capitalize<string>;
	reqId?: string;
	extra?: Record<string, unknown>;
};

type LoggerFnType = (
	data: LogType | Record<string, unknown>,
	msg?: string,
) => void;

type LoggerType = {
	trace: LoggerFnType;
	info: LoggerFnType;
	warn: LoggerFnType;
	error: LoggerFnType;
};

export type { LoggerType, LogType };
