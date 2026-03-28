import type {
	AuthStatusType,
	ChangeNameType,
	CheckAuthType,
	LoginRequiredType,
	LoginType,
	LogoutType,
	RegisterType,
	SafeUserType,
	StartVerificationType,
	TokenRefreshType,
	UserModelType,
	VerifieAccountType,
} from "./auth";
import type {
	AvatarModelType,
	NewAvatarType,
	RemoveAvatarType,
} from "./avater";
import type { CacheConfigType } from "./cache";
import type { JwtConfigType } from "./jwt";
import type { LoggerType } from "./log";
import type { MailConfigType } from "./mail";
import type {
	ChangePasswordType,
	ForgotPasswordType,
	ResetPasswordType,
} from "./password";
import type { TokenConfigType } from "./token";

type AuthPropsType = {
	User: UserModelType;
	Avatar: AvatarModelType;
	Cache: CacheConfigType;
	Mail: MailConfigType;
	extractToken: TokenConfigType;
	jwt: JwtConfigType;
	logger: LoggerType;
};

type AuthReturnType = {
	// auth
	login: LoginType;
	register: RegisterType;
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
	changeName: ChangeNameType;
	authStatus: AuthStatusType;
	// avatar
	newAvatar: NewAvatarType;
	removeAvatar: RemoveAvatarType;
};
type AuthType = (props: AuthPropsType) => AuthReturnType;

type TokenType = Pick<SafeUserType, "id"> & {
	type: "refresh" | "access";
};

export type { AuthPropsType, AuthReturnType, AuthType, TokenType };
