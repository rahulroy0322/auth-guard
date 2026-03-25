import { AuthBadError } from "../error";
import type {
	StartVerificationPropsType,
	StartVerificationReturnType,
	VerifieAccountPropsType,
	VerifieAccountReturnType,
} from "../types";
import { genReqId } from "../utils/request-id";
import { UserSanitizer } from "../utils/user-sanitizer";
import { UserService } from "./user.service";

class VerificationService extends UserService {
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

		const user = await this.User.findByEmail(email);
		const verifiedUser = this.Validator.validateForVerification(user, {
			reqId,
		});

		this.logger.trace({
			reqId,
			msg: "Removing old verification codes",
			extra: { userId: verifiedUser.id },
		});
		await this.Code.remove(verifiedUser, reqId);

		this.sendCode({
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

		await this.Code.verify({
			reqId,
			code,
			user: {
				id,
				email: "unknown",
				name: "unknown",
			},
		});

		const user = await this.User.updateById(id, {
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

		this.logger.trace({
			reqId,
			msg: "Removing verification code",
			extra: {
				userId: user.id,
			},
		});
		await this.Code.remove(user, reqId);

		const updatedUser = await this.User.findById(user.id);
		const verifiedUser = this.Validator.validateExists(
			updatedUser,
			{ reqId },
			"Invalid Code",
		);

		const token = this.Helper.signTokens(verifiedUser, reqId);

		this.logger.info({
			reqId,
			msg: "Account verification successful:)",
			user: verifiedUser,
		});

		return {
			token,
			user: UserSanitizer.removePassword(verifiedUser),
		};
	};
}

export { VerificationService };
