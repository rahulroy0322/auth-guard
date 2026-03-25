import { AuthService } from "./services/auth.service";
import { PasswordService } from "./services/password.service";
import { SessionService } from "./services/session.service";
import { VerificationService } from "./services/verification.service";
import type { AuthType } from "./types";
import { SmartLogger } from "./utils/smart-logger";
import { TokenBanManager } from "./utils/token-ban";
import { TokenHelper } from "./utils/token-helpers";
import { UserValidator } from "./utils/user-validation";
import { CodeManager } from "./utils/verification-code";

const init: AuthType = ({
	User,
	Cache,
	Mail,
	extractToken,
	jwt,
	logger: mainLogger,
}) => {
	const logger = new SmartLogger(mainLogger);

	const Validator = new UserValidator(logger);
	const Code = new CodeManager(Cache, logger);

	const Helper = new TokenHelper(jwt, logger);
	const BanManager = new TokenBanManager(Cache, logger);

	const authService = new AuthService({
		logger,
		Helper,
		Code,
		Mail,
		User,
		Validator,
	});

	const verificationService = new VerificationService({
		logger,
		Helper,
		Code,
		Mail,
		User,
		Validator,
	});

	const passwordService = new PasswordService({
		logger,
		Helper,
		Code,
		Mail,
		User,
		Validator,
	});

	const sessionService = new SessionService(jwt, {
		logger,
		Helper,
		User,
		Validator,
		BanManager,
		Token: extractToken,
	});

	return {
		// auth
		register: authService.register,
		login: authService.login,
		logout: sessionService.logout,
		changePassword: sessionService.changePassword,

		// register
		startVerification: verificationService.startVerification,
		verifieAccount: verificationService.verifieAccount,

		// pass
		forgotPassword: passwordService.forgotPassword,
		resetPassword: passwordService.resetPassword,

		// token
		checkAuth: sessionService.checkAuth,
		loginRequired: sessionService.loginRequired,
		tokenRefresh: sessionService.tokenRefresh,
	};
};

const auth = init;

export { auth, init };
