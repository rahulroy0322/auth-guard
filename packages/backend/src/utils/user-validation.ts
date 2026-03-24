import type { UserType } from "base";
import {
	AuthBadError,
	AuthNotVerifiedError,
	AuthUnAuthenticatedError,
} from "../error";

// biome-ignore lint/complexity/noStaticOnlyClass: ts error
class UserValidator {
	static validateExists(
		user: UserType | null,
		errorMessage = "User not found",
	): asserts user is UserType {
		if (!user) {
			throw new AuthBadError(errorMessage);
		}
	}

	static validateVerified(user: UserType): void {
		if (!user.verifiedAt) {
			throw new AuthNotVerifiedError();
		}
	}

	static validateNotBanned(user: UserType): void {
		if (user.isBaned) {
			throw new AuthUnAuthenticatedError("Your account has been banned");
		}
	}

	static validateHasPassword(user: UserType): void {
		if (!user.password) {
			throw new AuthBadError(
				"This account uses social login. Please login with your social provider.",
			);
		}
	}

	static validateForAuthentication(
		user: UserType | null,
	): asserts user is UserType {
		UserValidator.validateExists(user, "Invalid email or password");
		UserValidator.validateVerified(user);
		UserValidator.validateNotBanned(user);
	}

	static validateForPasswordAuth(
		user: UserType | null,
		msg: string = "Invalid email or password",
	): asserts user is UserType {
		UserValidator.validateExists(user, msg);
		UserValidator.validateVerified(user);
		UserValidator.validateNotBanned(user);
		UserValidator.validateHasPassword(user);
	}

	static validateForVerification(
		user: UserType | null,
	): asserts user is UserType {
		UserValidator.validateExists(user, "Invalid user");

		if (user.verifiedAt) {
			throw new AuthBadError("Your account is already verified");
		}
	}
}

export { UserValidator };
