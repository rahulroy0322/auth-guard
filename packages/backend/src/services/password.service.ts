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
import { BaseService } from "./base.service";

class PasswordService extends BaseService {
	public async forgotPassword({
		email,
	}: ForgotPasswordPropsType): Promise<ForgotPasswordReturnType> {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Processing forgot password request",
			extra: { email },
		});

		const user = await this.User.findByEmail(email);
		const verifiedUser = this.Validator.validateForPasswordAuth(
			user,
			{ reqId },
			"Email is invalid!",
		);

		this.logger.trace({
			reqId,
			msg: "Checking for existing code",
			extra: { userId: verifiedUser.id },
		});

		const codeExists = await this.Code.checkExists(verifiedUser);

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
	}

	public async resetPassword({
		id,
		password: passwd,
		code,
	}: ResetPasswordPropsType): Promise<ResetPasswordReturnType> {
		const reqId = genReqId();

		this.logger.trace({ reqId, msg: "Starting password reset", extra: { id } });

		await this.Code.verify({
			reqId,
			code,
			user: {
				id,
				email: "unknown",
				name: "unknown",
			},
		});
		await this.Code.remove(
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
		const user = await this.User.updateById(id, { password });

		if (!user) {
			this.logger.error({
				reqId,
				msg: "Failed to update user password",
				user,
			});
			throw new AuthBadError("Password reset failed");
		}

		const updatedUser = await this.User.findById(user.id);
		const verifiedUser = this.Validator.validateExists(updatedUser, {
			reqId,
		});

		// TODO! clear session

		const token = this.Helper.signTokens(verifiedUser, reqId);

		this.logger.info({
			reqId,
			msg: "Password reset successful:)",
			user: verifiedUser,
		});

		return {
			token,
			user: UserSanitizer.removePassword(verifiedUser),
		};
	}
}

export { PasswordService };
