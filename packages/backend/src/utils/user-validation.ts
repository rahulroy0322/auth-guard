import {
	AuthBadError,
	AuthNotVerifiedError,
	AuthUnAuthenticatedError,
} from "../error";
import type { LogType, SafeUserType, _UserType as UserType } from "../types";
import type { SmartLogger } from "./smart-logger";

type PropsType = Pick<LogType, "extra" | "reqId">;

class UserValidator {
	constructor(private readonly logger: SmartLogger) {}

	validateExists(
		user: SafeUserType | null,
		props: PropsType,
		errorMessage = "User not found",
	): SafeUserType {
		if (!user) {
			this.logger.error({
				msg: "User validation failed - user not found",
				user,
				...props,
			});
			throw new AuthBadError(errorMessage);
		}
		return user;
	}

	validateVerified(user: SafeUserType, props: PropsType): void {
		if (!user.verifiedAt) {
			this.logger.error({
				msg: "User validation failed - account not verified",
				user,
				...props,
			});
			throw new AuthNotVerifiedError();
		}
	}

	validateNotBanned(user: SafeUserType, props: PropsType): void {
		if (user.isBaned) {
			this.logger.error({
				msg: "User validation failed - account is banned",
				user,
				...props,
			});
			throw new AuthUnAuthenticatedError("Your account has been banned");
		}
	}

	validateHasPassword(user: UserType, props: PropsType): void {
		if (!user.password) {
			this.logger.error({
				msg: "User validation failed - no password set (social login account)",
				user,
				...props,
			});
			throw new AuthBadError(
				"This account uses social login. Please login with your social provider.",
			);
		}
	}

	validateForAuthentication(
		user: SafeUserType | null,
		props: PropsType,
		errorMessage: "Invalid email or password",
	): SafeUserType {
		const verifiedUser = this.validateExists(user, props, errorMessage);
		this.validateVerified(verifiedUser, props);
		this.validateNotBanned(verifiedUser, props);
		return verifiedUser;
	}

	validateForPasswordAuth(
		user: UserType | null,
		props: PropsType,
		errorMessage = "Invalid email or password",
	): UserType {
		const verifiedUser = this.validateExists(
			user,
			props,
			errorMessage,
		) as UserType;

		this.validateVerified(verifiedUser, props);
		this.validateNotBanned(verifiedUser, props);
		this.validateHasPassword(verifiedUser, props);
		return verifiedUser;
	}

	validateForVerification(
		user: SafeUserType | null,
		props: PropsType,
		errorMessage = "Invalid user",
	): SafeUserType {
		const verifiedUser = this.validateExists(user, props, errorMessage);

		if (verifiedUser.verifiedAt) {
			this.logger.error({
				msg: "User validation failed - account already verified",
				user,
				...props,
			});
			throw new AuthBadError("Your account is already verified");
		}

		return verifiedUser;
	}
}

export { UserValidator };
