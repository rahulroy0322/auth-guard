class AuthError extends Error {
	constructor(
		message: string,
		public status = 500,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

// 4**
class AuthBadError extends AuthError {
	constructor(msg = "Invalid credentials provided!") {
		super(msg, 400);
	}
}

class AuthExpiredError extends AuthError {
	constructor(msg = "Token Expired!") {
		super(msg, 401);
	}
}

class AuthNoTokenError extends AuthError {
	constructor(msg = "No Token Provided!") {
		super(msg, 401);
	}
}

class AuthWrongTokenError extends AuthError {
	constructor(msg = "Wrong Token Provided!") {
		super(msg, 401);
	}
}

class AuthUnAuthenticatedError extends AuthError {
	constructor(msg = "Token Required!") {
		super(msg, 401);
	}
}

// class ForbidenError extends AuthError {
// 	constructor(msg = "You Don't Sufficient permition") {
// 		super(msg, 403)
// 	}
// }

class AuthConflictError extends AuthError {
	constructor(msg = "Conflict") {
		super(msg, 409);
	}
}

//5**
class AuthServerError extends AuthError {
	constructor(msg = "Something went wrong!") {
		super(msg, 500);
	}
}

export {
	// 4**
	AuthBadError,
	// ForbidenError,
	AuthConflictError,
	AuthError,
	AuthExpiredError,
	AuthNoTokenError,
	// 5**
	AuthServerError,
	AuthUnAuthenticatedError,
	AuthWrongTokenError,
};
