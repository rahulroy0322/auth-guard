import { AuthBadError } from "../error";
import type {
	ForgotPasswordPropsType,
	ForgotPasswordReturnType,
	ResetPasswordPropsType,
	ResetPasswordReturnType,
} from "../types";
import { hashPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import { UserSanitizer } from "../utils/user-sanitizer";
import { UserService } from "./user.service";

class PasswordService extends UserService {
	public forgotPassword = async ({
		email,
	}: ForgotPasswordPropsType): Promise<ForgotPasswordReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Processing forgot password request",
			extra: { email },
		});

		const user = await this.user.findByEmail(email);
		const verifiedUser = this.validator.validateForPasswordAuth(
			user,
			{ reqId },
			"Email is invalid!",
		);

		this.logger.trace({
			reqId,
			msg: "Checking for existing code",
			extra: { userId: verifiedUser.id },
		});

		const codeExists = await this.code.checkExists(verifiedUser);

		if (codeExists) {
			this.logger.error({
				reqId,
				msg: "Too Many Requests",
				user: verifiedUser,
			});
			return { id: verifiedUser.id };
		}

		// TODO! clear session

		this.sendCode({
			reqId,
			kind: "forgot",
			user: verifiedUser,
		});

		return { id: verifiedUser.id };
	};

	public resetPassword = async ({
		id,
		password: passwd,
		code,
	}: ResetPasswordPropsType): Promise<ResetPasswordReturnType> => {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting password reset", extra: { id } });

		await this.code.verify({
			reqId,
			code,
			user: {
				id,
				email: "unknown",
				name: "unknown",
			},
		});
		await this.code.remove(
			{
				id,
			},
			reqId,
		);

		this.logger.trace({
			reqId,
			msg: "Hashing new Password",
			extra: { userId: id },
		});

		const password = await hashPassword(passwd);

		this.logger.trace({ reqId, msg: "Reseting user Password" });
		const user = await this.user.updateById(id, { password });

		if (!user) {
			this.logger.error({
				reqId,
				msg: "Failed to update user password",
				user,
			});
			throw new AuthBadError("Password reset failed");
		}

		const sanitizedUser = UserSanitizer.removePassword(user);
		await this.userCache.cacheData(user.id, sanitizedUser, { reqId });
		const avatar = await this.avatarCache.findByUserId(sanitizedUser.id, {
			reqId,
		});

		// TODO! clear session

		const token = this.helper.signTokens(user, reqId);

		this.logger.info({
			reqId,
			msg: "Password reset successful:)",
			user,
		});

		return {
			token,
			user: {
				...user,
				avatar,
				// TODO!
				profiles: [],
			},
		};
	};
}

export { PasswordService };
