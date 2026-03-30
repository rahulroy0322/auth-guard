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

		const user = await this.user.findByEmail(email);
		const verifiedUser = this.validator.validateForVerification(user, {
			reqId,
		});

		this.logger.trace({
			reqId,
			msg: "Removing old verification codes",
			extra: { userId: verifiedUser.id },
		});
		await this.code.remove(verifiedUser, reqId);

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

		await this.code.verify({
			reqId,
			code,
			user: {
				id,
				email: "unknown",
				name: "unknown",
			},
		});

		const user = await this.user.updateById(id, {
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
		await this.code.remove(user, reqId);

		const sanitizedUser = UserSanitizer.removePassword(user);

		await this.userCache.cacheData(user.id, sanitizedUser, {
			reqId,
		});
		const avatar = await this.avatarCache.findByUserId(sanitizedUser.id, {
			reqId,
		});
		const profiles = await this.profileCache.findByUserId(sanitizedUser.id, {
			reqId,
		});

		const token = this.helper.signTokens(user, reqId);

		this.logger.info({
			reqId,
			msg: "Account verification successful:)",
			user,
		});

		return {
			token,
			user: {
				...sanitizedUser,
				avatar,
				profiles,
			},
		};
	};
}

export { VerificationService };
