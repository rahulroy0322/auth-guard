import type { UserCacheModel } from "../cache/user";
import { AuthBadError } from "../error";
import type {
	StartVerificationPropsType,
	StartVerificationReturnType,
	UserModelType,
	VerifieAccountPropsType,
	VerifieAccountReturnType,
} from "../types";
import type { CodeFlowHelper } from "../utils/code-flow";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { UserValidator } from "../utils/user-validation";
import type { CodeManager } from "../utils/verification-code";
import type { CodeService } from "./code.service";
import type { UserService } from "./user.service";

class VerificationService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly userModel: Pick<
			UserModelType,
			"findByEmail" | "updateById"
		>,
		private readonly codeService: CodeService,
		private readonly useerService: UserService,
		private readonly userCache: UserCacheModel,
		private readonly validator: UserValidator,
		private readonly helper: TokenHelper,
		private readonly codeFlowHelper: CodeFlowHelper,
		private readonly codeManager: CodeManager,
	) {}

	public startVerification = async ({
		email,
	}: StartVerificationPropsType): Promise<StartVerificationReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting verification process",
			extra: {
				email,
			},
		});

		const user = await this.userModel.findByEmail(email);
		const verifiedUser = this.validator.validateForVerification(user, {
			reqId,
		});

		this.logger.trace({
			reqId,
			msg: "Removing old verification codes",
			extra: { userId: verifiedUser.id },
		});
		await this.codeManager.remove(verifiedUser, reqId);

		this.codeService.sendCode({
			kind: "verification",
			reqId,
			user: verifiedUser,
		});

		return { id: verifiedUser.id };
	};

	public verifieAccount = async ({
		id,
		code,
	}: VerifieAccountPropsType): Promise<VerifieAccountReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting account verification",
			extra: { id },
		});

		await this.codeFlowHelper.verifyAndRemove({
			userId: id,
			reqId,
			code,
		});

		const user = await this.userModel.updateById(id, {
			verifiedAt: new Date(),
		});

		if (!user) {
			this.logger.error({
				reqId,
				msg: "Failed to update user verification status",
				user,
			});
			throw new AuthBadError("Verification failed");
		}

		const sanitizedUser = UserSanitizer.removePassword(user);

		await this.userCache.cacheData(user.id, sanitizedUser, {
			reqId,
		});

		const token = this.helper.signTokens(user, reqId);

		this.logger.info({
			reqId,
			msg: "Account verification successful:)",
			user,
		});

		return AuthResponseBuilder.buildAuthResponse(sanitizedUser, token, () =>
			this.useerService.fetchUserWithRelations(sanitizedUser.id, { reqId }),
		);
	};
}

export { VerificationService };
