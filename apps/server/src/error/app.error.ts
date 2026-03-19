import type { ZodError as ZE } from "zod";

type MetaType = Record<string, unknown>;

type ZodErrorType = {
	path: string;
	code: string;
	message: string;
};

const formatZodError = (e: ZE) =>
	e.issues.reduce((acc, { code, path, message }) => {
		acc.push({
			path: path.join("."),
			message,
			code,
		});

		return acc;
	}, [] as ZodErrorType[]);

// Errors
class AppError extends Error {
	constructor(
		message: string,
		public status = 500,
		public meta: MetaType = {},
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

// 4**
class ZodError extends AppError {
	override meta: {
		errors: ZodErrorType[];
	};

	constructor(error: ZE, msg = "Invalid credentials provided!") {
		const e = {
			errors: formatZodError(error),
		};

		super(msg, 400, e);
		this.meta = e;
	}
}

class BadError extends AppError {
	constructor(msg = "Invalid credentials provided!", meta: unknown = {}) {
		super(msg, 400, meta as MetaType);
	}
}

class ExpiredError extends AppError {
	constructor(msg = "Token Expired!", meta: unknown = {}) {
		super(msg, 401, meta as MetaType);
	}
}

class UnAuthenticatedError extends AppError {
	constructor(msg = "Token Required!", meta: unknown = {}) {
		super(msg, 401, meta as MetaType);
	}
}

class ForbidenError extends AppError {
	constructor(msg = "You Don't Sufficient permition", meta: unknown = {}) {
		super(msg, 403, meta as MetaType);
	}
}

class NotFoundError extends AppError {
	constructor(msg = "Resource Not Found", meta: unknown = {}) {
		super(msg, 404, meta as MetaType);
	}
}

class ConflictError extends AppError {
	constructor(msg = "Conflict", meta: unknown = {}) {
		super(msg, 409, meta as MetaType);
	}
}

//5**
class ServerError extends AppError {
	constructor(msg = "Something went wrong!", meta: unknown = {}) {
		super(msg, 500, meta as MetaType);
	}
}

class ServiceError extends AppError {
	constructor(msg = "Service not ablleable!", meta: unknown = {}) {
		// TODO!
		super(msg, 503, meta as MetaType);
	}
}

export type { MetaType };

export {
	AppError,
	BadError,
	ConflictError,
	ExpiredError,
	ForbidenError,
	NotFoundError,
	// 5**
	ServerError,
	ServiceError,
	UnAuthenticatedError,
	// 4**
	ZodError,
};
