import type {
	AuthPropsType,
	AuthReturnType,
	ProviderType,
	SessionType,
	UserType,
} from "@auth-guard/backend";
import type { NextRequest, NextResponse } from "next/server";

type ResType = {
	success: true;
	data:
		| {
				user?: Omit<UserType, "password">;
				token?: string;
		  }
		| {
				id?: string;
				message: string;
		  }
		| {
				authenticated: true;
				token: string;
				user: Omit<UserType, "password">;
		  }
		| {
				authenticated: false;
				user: null;
		  }
		| {
				url: string;
		  }
		| {
				sessions: SessionType[];
		  };
};

type HandlerType = <T extends ProviderType>(
	coreApi: AuthReturnType<T>,
	req: NextRequest,
) => Promise<NextResponse>;

type HandleAuthPropsType<T extends ProviderType> = Omit<
	AuthPropsType<T>,
	"jwt" | "extractToken"
> & {
	jwtSecret: string;
};

type HandleAuthType = <T extends ProviderType>(
	props: HandleAuthPropsType<T>,
) => (req: NextRequest, res: NextResponse) => NextResponse;

export type {
	AuthPropsType,
	AuthReturnType,
	AuthStatusReturnType,
	AuthStatusType,
	AuthType,
	AvatarModelType,
	AvatarType,
	CacheConfigType,
	CacheKeysType,
	CacheKeyType,
	ChangePasswordReturnType,
	ChangePasswordType,
	CheckAuthReturnType,
	CheckAuthType,
	CodeType,
	ForgotPasswordPropsType,
	ForgotPasswordReturnType,
	ForgotPasswordType,
	GetSessionsReturnType,
	GetSessionsType,
	JwtConfigType,
	LoggerType,
	LoginPropsType,
	LoginRequiredReturnType,
	LoginRequiredType,
	LoginReturnType,
	LoginType,
	LogoutType,
	LogType,
	MailConfigType,
	NewAvatarPropsType,
	NewAvatarReturnType,
	NewAvatarType,
	OAuthLoginPropsType,
	OAuthLoginReturnType,
	OAuthLoginType,
	OAuthStartType,
	OAuthType,
	ProfileModelType,
	ProfileType,
	ProviderType,
	RegisterPropsType,
	RegisterReturnType,
	RegisterType,
	RemoveAvatarReturnType,
	RemoveAvatarType,
	ResetPasswordPropsType,
	ResetPasswordReturnType,
	ResetPasswordType,
	ReturnUserType,
	RoleType,
	SafeUserType,
	SendMailPropsType,
	SessionModelType,
	SessionType,
	StartVerificationPropsType,
	StartVerificationReturnType,
	StartVerificationType,
	TokenConfigType,
	TokenRefreshReturnType,
	TokenRefreshType,
	TokenType,
	UpdateProfileReturnType,
	UpdateProfileType,
	UserModelType,
	UserType,
	VerifyAccountPropsType,
	VerifyAccountReturnType,
	VerifyAccountType,
} from "@auth-guard/backend/types";
export type { HandleAuthPropsType, HandleAuthType, HandlerType, ResType };
