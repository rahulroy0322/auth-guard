import { AuthBadError, AuthConflictError, AuthServerError } from "../error";
import type {
	LoginPropsType,
	LoginReturnType,
	RegisterPropsType,
	RegisterReturnType,
} from "../types";
import { hashPassword, validPassword } from "../utils/password";
import { genReqId } from "../utils/request-id";
import { UserSanitizer } from "../utils/user-sanitizer";
import { BaseService } from "./base.service";

class AuthService extends BaseService {
	public async register({
		password: passwd,
		...data
	}: RegisterPropsType): Promise<RegisterReturnType> {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			extra: {
				...data,
			},
			msg: "Starting Registration",
		});

		const existingUser = (await this.User.findByEmail(data.email)) ?? null;

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
		const user = await this.User.create({
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
		this.sendCode({
			reqId,
			kind: "verification",
			user,
		});

		this.logger.info({
			reqId,
			msg: "User Registration successful:)",
			user,
		});

		return { id: user.id };
	}

	public async login({
		password: passwd,
		email,
	}: LoginPropsType): Promise<LoginReturnType> {
		const reqId = genReqId();

		this.logger.trace({
			reqId,
			msg: "Starting Login",
			extra: { email },
		});

		const user = await this.User.findByEmail(email);

		const verifiedUser = this.Validator.validateForPasswordAuth(
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

		const token = this.Helper.signTokens(verifiedUser, reqId);

		this.logger.info({
			reqId,
			msg: "User Login successful:)",
			user: verifiedUser,
		});

		return {
			token,
			user: UserSanitizer.removePassword(verifiedUser),
		};
	}
}

export { AuthService };
