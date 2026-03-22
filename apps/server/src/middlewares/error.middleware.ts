import { AuthError } from "@auth-guard/express";
import type { ErrorRequestHandler } from "express";
import { isDev } from "../config/env.config";
import { AppError, type MetaType } from "../error/app.error";
import logger from "../logger/pino";
import type { ErrorType } from "../types";

const getError = (
	e: unknown,
): {
	name: string;
	message: string;
	stack?: string;
	status: number;
	meta?: MetaType;
	extra?: unknown;
} => {
	if (e instanceof AuthError) {
		return {
			name: e.name,
			message: e.message,
			stack: e.stack,
			status: e.status,
		};
	}
	if (e instanceof AppError) {
		return {
			name: e.name,
			message: e.message,
			stack: e.stack,
			meta: e.meta,
			status: e.status,
		};
	}

	if (e instanceof Error) {
		return {
			name: e.name,
			message: e.message,
			stack: e.stack,
			status: 500,
		};
	}

	return {
		name: "Unknown Error",
		message: "Internal Server Error",
		status: 500,
		extra: e,
	};
};

const errorMiddleware: ErrorRequestHandler = (e, _req, res, _next) => {
	const { status, ...error } = getError(e);
	logger.error(error, "Error happended!");
	if (!isDev) {
		delete error.stack;
		delete error.meta;
		delete error.extra;
	}

	res.status(status).json({
		success: false,
		error,
	} satisfies ErrorType);
};

export { errorMiddleware };
