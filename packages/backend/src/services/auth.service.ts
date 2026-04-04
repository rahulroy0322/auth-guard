import type { UserCacheModel } from "../cache/user";
import { AuthBadError, AuthConflictError, AuthServerError } from "../error";
import type {
	LoginPropsType,
	LoginReturnType,
	RegisterPropsType,
	RegisterReturnType,
	UserModelType,
} from "../types";
import type { SessionModelType } from "../types/session";
import { hashPassword, validPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import { AuthResponseBuilder } from "../utils/response-builder";
import type { SmartLogger } from "../utils/smart-logger";
import type { TokenHelper } from "../utils/token-helpers";
import { UserSanitizer } from "../utils/user-sanitizer";
import type { UserValidator } from "../utils/user-validation";
import type { CodeService } from "./code.service";
import type { UserService } from "./user.service";

class AuthService {
	constructor(
		private readonly logger: SmartLogger,
		private readonly userModel: Pick<UserModelType, "create" | "findByEmail">,
		private readonly sessionModel: Pick<SessionModelType, "create">,
		private readonly userService: UserService,
		private readonly codeService: CodeService,
		private readonly userCache: UserCacheModel,
		private readonly validator: UserValidator,
		private readonly helper: TokenHelper,
	) {}

	public register = async ({
		password: passwd,
		...data
	}: RegisterPropsType): Promise<RegisterReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			extra: {
				...data,
			},
			msg: "Starting Registration",
		});

		const existingUser = (await this.userModel.findByEmail(data.email)) ?? null;

		if (existingUser) {
			this.logger.error({
				reqId,
				msg: "Trying to Create Account Again",
				user: existingUser,
			});
			throw new AuthConflictError("User Already Exists!");
		}

		this.logger.trace({ reqId, msg: "Hashing Password" });
		const password = await hashPassword(passwd);

		this.logger.trace({ reqId, msg: "Creating User" });
		const user = await this.userModel.create({
			...data,
			password,
			roles: ["user"],
		});

		if (!user) {
			this.logger.error({
				reqId,
				msg: "User creation failed",
				user,
				extra: data,
			});
			throw new AuthServerError("Failed to create user account");
		}
		this.codeService.sendCode({
			reqId,
			kind: "register",
			user,
		});

		this.logger.info({
			reqId,
			msg: "User Registration successful:)",
			user,
		});

		return { id: user.id };
	};

	public login = async ({
		password: passwd,
		email,
		deviceId,
		deviceName,
		deviceType,
	}: LoginPropsType): Promise<LoginReturnType> => {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting Login",
			extra: { email },
		});

		const user = await this.userModel.findByEmail(email);

		const verifiedUser = this.validator.validateForPasswordAuth(
			user,
			{ reqId },
			"Invalid email or password",
		);

		this.logger.trace({
			reqId,
			msg: "Validating Password",
			extra: { userId: verifiedUser.id },
		});

		if (
			!(await validPassword({
				current: passwd,
				hash: verifiedUser.password as string,
			}))
		) {
			this.logger.error({
				reqId,
				msg: "Invalid password attempt",
				user: verifiedUser,
			});
			throw new AuthBadError("Invalid email or password");
		}

		const token = this.helper.signTokens(verifiedUser, reqId);

		const session = await this.sessionModel.create({
			token: token.refresh,
			userId: verifiedUser.id,
			isActive: true,
			deviceId,
			deviceName,
			deviceType,
		});
		if (!session) {
			this.logger.error({
				reqId,
				msg: "Session Create failed",
				user: verifiedUser,
			});
			throw new AuthServerError("Session Create failed");
		}

		this.logger.info({
			reqId,
			msg: "User Login successful:)",
			user: verifiedUser,
		});

		const sanitizedUser = UserSanitizer.removePassword(verifiedUser);

		this.userCache.cacheData(verifiedUser.id, sanitizedUser, {
			reqId,
		});

		return await AuthResponseBuilder.buildAuthResponse(
			sanitizedUser,
			token,
			() =>
				this.userService.fetchUserWithRelations(sanitizedUser.id, { reqId }),
		);
	};
}

export { AuthService };
