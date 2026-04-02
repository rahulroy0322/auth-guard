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

class AuthInvalidCodeError extends AuthError {
	constructor() {
		super("Invalid Code", 400);
	}
}

class AuthInvalidTokenError extends AuthError {
	constructor() {
		super("Invalid Token", 400);
	}
}

class AuthInvalidUserError extends AuthError {
	constructor() {
		super("Invalid User", 400);
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

class AuthNotVerifiedError extends AuthError {
	constructor(msg = "Your Account is not verified please verify to login") {
		super(msg, 403);
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
	AuthInvalidCodeError,
	AuthInvalidTokenError,
	AuthInvalidUserError,
	AuthNoTokenError,
	AuthNotVerifiedError,
	// 5**
	AuthServerError,
	AuthUnAuthenticatedError,
	AuthWrongTokenError,
};
