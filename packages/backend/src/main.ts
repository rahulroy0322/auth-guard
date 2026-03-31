import { AvatarCacheModel } from "./cache/avatar";
import { ProfileCacheModel } from "./cache/profile";
import { UserCacheModel } from "./cache/user";
import { AuthService } from "./services/auth.service";
import { AvatarService } from "./services/avatar.service";
import { CodeService } from "./services/code.service";
import { PasswordService } from "./services/password.service";
import { ProfileService } from "./services/profile.service";
import { ProviderService } from "./services/provider.service";
import { SessionService } from "./services/session.service";
import { UserService } from "./services/user.service";
import { VerificationService } from "./services/verification.service";
import type { AuthReturnType, AuthType } from "./types/index";
import { CodeFlowHelper } from "./utils/code-flow";
import { SmartLogger } from "./utils/smart-logger";
import { TokenBanManager } from "./utils/token-ban";
import { TokenExtractor } from "./utils/token-extractor";
import { TokenHelper } from "./utils/token-helpers";
import { UserSanitizer } from "./utils/user-sanitizer";
import { UserValidator } from "./utils/user-validation";
import { CodeManager } from "./utils/verification-code";

const init: AuthType = ({
	User: userModel,
	Avatar: avatarModel,
	Profile: profileModel,
	Session: sessionModel,
	Cache,
	Mail,
	extractToken: tokenConfig,
	jwt,
	logger: mainLogger,
}): AuthReturnType => {
	const logger = new SmartLogger(mainLogger);

	const validator = new UserValidator(logger);
	const codeManager = new CodeManager(logger, Cache);
	const codeFlowHelper = new CodeFlowHelper(logger, codeManager);
	const tokenExtractor = new TokenExtractor(tokenConfig, jwt);

	const helper = new TokenHelper(logger, jwt);
	const banManager = new TokenBanManager(logger, Cache);

	const avatarCache = new AvatarCacheModel(logger, "avatar", Cache, {
		findByUserId: avatarModel.findActiveByUserId,
	});
	const profileCache = new ProfileCacheModel(
		logger,
		"profiles",
		Cache,
		profileModel,
	);

	const userCache = new UserCacheModel(
		logger,
		"user",
		Cache,
		{
			findById: async (id) => {
				const user = await userModel.findById(id);

				if (!user) {
					return null;
				}

				return UserSanitizer.removePassword(user);
			},
		},
		avatarCache,
		profileCache,
	);

	const userService = new UserService(avatarCache, profileCache);
	const codeService = new CodeService(logger, codeManager, Mail);

	const authService = new AuthService(
		logger,
		userModel,
		sessionModel,
		userService,
		codeService,
		userCache,
		validator,
		helper,
	);
	const verificationService = new VerificationService(
		logger,
		userModel,
		sessionModel,
		codeService,
		userService,
		userCache,
		validator,
		helper,
		codeFlowHelper,
		codeManager,
	);

	const passwordService = new PasswordService(
		logger,
		userModel,
		sessionModel,
		userService,
		codeService,
		userCache,
		validator,
		helper,
		codeFlowHelper,
		codeManager,
	);

	const sessionService = new SessionService(
		logger,
		sessionModel,
		userService,
		userCache,
		validator,
		helper,
		tokenConfig,
		banManager,
		tokenExtractor,
	);

	const avatarService = new AvatarService(
		logger,
		avatarModel,
		userService,
		sessionService,
		avatarCache,
	);

	const profileService = new ProfileService(
		logger,
		userModel,
		sessionModel,
		userService,
		avatarService,
		sessionService,
		userCache,
		avatarCache,
		helper,
		tokenConfig,
		jwt,
		banManager,
	);

	const providerService = new ProviderService(
		logger,
		userModel,
		profileModel,
		sessionModel,
		avatarService,
		userCache,
		profileCache,
		helper,
	);

	return {
		// auth
		register: authService.register,
		login: authService.login,
		logout: sessionService.logout,
		loginWithProvider: providerService.loginWithProvider,

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
