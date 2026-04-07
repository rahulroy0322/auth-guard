import type { ProviderType } from "base";
import type {
	AuthStatusType,
	CheckAuthType,
	GetSessionsType,
	LoginRequiredType,
	LoginType,
	LogoutType,
	RegisterType,
	SafeUserType,
	StartVerificationType,
	TokenRefreshType,
	UpdateProfileType,
	UserModelType,
	VerifieAccountType,
} from "./auth";
import type { AvatarModelType, RemoveAvatarType } from "./avatar";
import type { CacheConfigType } from "./cache";
import type { JwtConfigType } from "./jwt";
import type { LoggerType } from "./log";
import type { MailConfigType } from "./mail";
import type { OAuthLoginType, OAuthStartType, OAuthType } from "./OAuth";
import type {
	ChangePasswordType,
	ForgotPasswordType,
	ResetPasswordType,
} from "./password";
import type { ProfileModelType } from "./profile";
import type { SessionModelType } from "./session";
import type { TokenConfigType } from "./token";

type AuthPropsType<T extends ProviderType> = {
	OAuth?: OAuthType<T>;
	User: UserModelType;
	Avatar: AvatarModelType;
	Profile: ProfileModelType;
	Session: SessionModelType;
	Cache: CacheConfigType;
	Mail: MailConfigType;
	extractToken: TokenConfigType;
	jwt: JwtConfigType;
	logger: LoggerType;
};

type AuthReturnType<T extends ProviderType> = {
	// auth
	login: LoginType;
	register: RegisterType;
	oAuthStart: OAuthStartType<T>;
	loginWithProvider: OAuthLoginType<T>;
	startVerification: StartVerificationType;
	verifieAccount: VerifieAccountType;
	// pass
	forgotPassword: ForgotPasswordType;
	resetPassword: ResetPasswordType;
	changePassword: ChangePasswordType;
	// auth state
	checkAuth: CheckAuthType;
	loginRequired: LoginRequiredType;
	// logged-in
	logout: LogoutType;
	tokenRefresh: TokenRefreshType;
	authStatus: AuthStatusType;
	getSessions: GetSessionsType;
	// avatar
	removeAvatar: RemoveAvatarType;
	// profile
	updateProfile: UpdateProfileType;
};

type AuthType = <T extends ProviderType>(
	props: AuthPropsType<T>,
) => AuthReturnType<T>;

type TokenType = Pick<SafeUserType, "id"> & {
	type: "refresh" | "access";
};

export type { AuthPropsType, AuthReturnType, AuthType, TokenType };
