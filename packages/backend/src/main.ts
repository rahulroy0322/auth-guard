import { AuthService } from "./services/auth.service";
import { AvatarService } from "./services/avatar.service";
import { PasswordService } from "./services/password.service";
import { ProfileService } from "./services/profile.service";
import { SessionService } from "./services/session.service";
import { VerificationService } from "./services/verification.service";
import type { AuthReturnType, AuthType } from "./types";
import { SmartLogger } from "./utils/smart-logger";
import { TokenBanManager } from "./utils/token-ban";
import { TokenHelper } from "./utils/token-helpers";
import { UserValidator } from "./utils/user-validation";
import { CodeManager } from "./utils/verification-code";

const init: AuthType = ({
	User,
	Avatar,
	Cache,
	Mail,
	extractToken,
	jwt,
	logger: mainLogger,
}) => {
	const logger = new SmartLogger(mainLogger);

	const validator = new UserValidator(logger);
	const code = new CodeManager(Cache, logger);

	const helper = new TokenHelper(jwt, logger);
	const banManager = new TokenBanManager(Cache, logger);

	const authService = new AuthService({
		logger,
		Helper: helper,
		Code: code,
		Mail,
		User,
		Validator: validator,
	});

	const verificationService = new VerificationService({
		logger,
		Helper: helper,
		Code: code,
		Mail,
		User,
		Validator: validator,
	});

	const passwordService = new PasswordService({
		logger,
		Helper: helper,
		Code: code,
		Mail,
		User,
		Validator: validator,
	});

	const sessionService = new SessionService(jwt, {
		logger,
		Helper: helper,
		User,
		Validator: validator,
		BanManager: banManager,
		Token: extractToken,
	});

	const profileService = new ProfileService(jwt, {
		logger,
		Helper: helper,
		User,
		Session: sessionService,
		banManager,
		token: extractToken,
	});

	const avatarService = new AvatarService({
		logger,
		avatar: Avatar,
		session: sessionService,
	});

	return {
		// auth
		register: authService.register,
		login: authService.login,
		logout: sessionService.logout,

		// logged-in
		changePassword: profileService.changePassword,
		changeName: profileService.changeName,
		authStatus: sessionService.authStatus,
		newAvatar: avatarService.newAvatar,
		removeAvatar: avatarService.removeAvatar,

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
	} satisfies AuthReturnType;
};

const auth = init;

export { auth, init };
