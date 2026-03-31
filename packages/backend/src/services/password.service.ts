import type { UserCacheModel } from "../cache/user";
import { AuthBadError } from "../error";
import type {
	ForgotPasswordPropsType,
	ForgotPasswordReturnType,
	ResetPasswordPropsType,
	ResetPasswordReturnType,
	UserModelType,
} from "../types";
import type { CodeFlowHelper } from "../utils/code-flow";
import { hashPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { UserValidator } from "../utils/user-validation";
import type { CodeManager } from "../utils/verification-code";
import type { CodeService } from "./code.service";
import type { UserService } from "./user.service";

class PasswordService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly userModel: Pick<
			UserModelType,
			"findByEmail" | "updateById"
		>,
		private readonly userService: UserService,
		private readonly codeService: CodeService,
		private readonly userCache: UserCacheModel,
		private readonly validator: UserValidator,
		private readonly helper: TokenHelper,
		private readonly codeFlowHelper: CodeFlowHelper,
		private readonly codeManager: CodeManager,
	) {}

	public forgotPassword = async ({
		email,
	}: ForgotPasswordPropsType): Promise<ForgotPasswordReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Processing forgot password request",
			extra: { email },
		});

		const user = await this.userModel.findByEmail(email);
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

		const codeExists = await this.codeManager.checkExists(verifiedUser);

		if (codeExists) {
			this.logger.error({
				reqId,
				msg: "Too Many Requests",
				user: verifiedUser,
			});
			return { id: verifiedUser.id };
		}

		// TODO! clear session

		this.codeService.sendCode({
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

		await this.codeFlowHelper.verifyAndRemove({
			code,
			reqId,
			userId: id,
		});

		this.logger.trace({
			reqId,
			msg: "Hashing new Password",
			extra: { userId: id },
		});

		const password = await hashPassword(passwd);

		this.logger.trace({ reqId, msg: "Reseting user Password" });
		const user = await this.userModel.updateById(id, { password });

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

		// TODO! clear session

		const token = this.helper.signTokens(user, reqId);

		this.logger.info({
			reqId,
			msg: "Password reset successful:)",
			user,
		});

		return AuthResponseBuilder.buildAuthResponse(user, token, () =>
			this.userService.fetchUserWithRelations(user.id, { reqId }),
		);
	};
}

export { PasswordService };
