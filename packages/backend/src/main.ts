import { CacheModel } from "./cache.model";
import { AuthService } from "./services/auth.service";
import { AvatarService } from "./services/avatar.service";
import { PasswordService } from "./services/password.service";
import { ProfileService } from "./services/profile.service";
import { SessionService } from "./services/session.service";
import { VerificationService } from "./services/verification.service";
import type { AuthReturnType, AuthType, SafeUserType } from "./types/index";
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
}): AuthReturnType => {
	const logger = new SmartLogger(mainLogger);

	const validator = new UserValidator(logger);
	const code = new CodeManager(Cache, logger);

	const helper = new TokenHelper(jwt, logger);
	const banManager = new TokenBanManager(Cache, logger);

	const userCache = new CacheModel<SafeUserType>("user", logger, User, Cache);

	const authService = new AuthService({
		logger,
		helper,
		code,
		mail: Mail,
		userCache,
		user: User,
		validator,
	});

	const verificationService = new VerificationService({
		logger,
		helper,
		code,
		mail: Mail,
		userCache,
		user: User,
		validator,
	});

	const passwordService = new PasswordService({
		logger,
		helper,
		code,
		mail: Mail,
		userCache,
		user: User,
		validator,
	});

	const sessionService = new SessionService(jwt, {
		logger,
		helper,
		userCache,
		validator,
		banManager,
		token: extractToken,
	});

	const avatarService = new AvatarService({
		logger,
		avatar: Avatar,
		session: sessionService,
	});

	const profileService = new ProfileService(jwt, {
		logger,
		helper,
		userCache,
		user: User,
		session: sessionService,
		avatar: avatarService,
		banManager,
		token: extractToken,
	});

	return {
		// auth
		register: authService.register,
		login: authService.login,
		logout: sessionService.logout,

		// logged-in
		changePassword: profileService.changePassword,
		authStatus: sessionService.authStatus,
		removeAvatar: avatarService.removeAvatar,
		updateProfile: profileService.updateProfile,

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
