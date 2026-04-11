import type { IncomingMessage } from "node:http";
import type {
	SessionFormatedType,
	SessionType,
	UserType,
} from "@auth-guard/types";
import type { CodeType } from "./code";

type _UserType = Omit<UserType, "avatar" | "profiles">;

type SafeUserType = Omit<UserType, "password" | "avatar" | "profiles">;

type ReturnUserType = Omit<UserType, "password">;

type UserModelType = {
	findById: (id: UserType["id"]) => Promise<_UserType | null>;
	findByEmail: (email: UserType["email"]) => Promise<_UserType | null>;

	create: (
		data: Pick<_UserType, "email" | "name" | "roles"> & Partial<_UserType>,
	) => Promise<_UserType | null>;

	updateById: (
		id: UserType["id"],
		data: Partial<_UserType>,
	) => Promise<_UserType | null>;
};

type RegisterPropsType = Pick<_UserType, "email" | "name"> & {
	password: string;
};
type RegisterReturnType = Pick<_UserType, "id">;
type RegisterType = (data: RegisterPropsType) => Promise<RegisterReturnType>;

type LoginPropsType = Pick<_UserType, "email"> &
	Pick<SessionType, "deviceType" | "deviceId" | "deviceName"> & {
		password: string;
	};
type LoginReturnType = {
	user: ReturnUserType;
	token: {
		refresh: string;
		access: string;
	};
};
type LoginType = (data: LoginPropsType) => Promise<LoginReturnType>;

type CheckAuthReturnType = {
	user: ReturnUserType | null;
};
type CheckAuthType = (
	req: IncomingMessage,
	reqId?: string,
) => Promise<CheckAuthReturnType>;

type LoginRequiredReturnType = Pick<LoginReturnType, "user">;
type LoginRequiredType = (
	req: IncomingMessage,
	extra?: { reqId?: string },
) => Promise<LoginRequiredReturnType>;

type TokenRefreshReturnType = Pick<LoginReturnType, "user"> & {
	token: {
		refresh?: string;
		access: string;
	};
};
type TokenRefreshType = (
	req: IncomingMessage,
) => Promise<TokenRefreshReturnType>;

type LogoutType = (req: IncomingMessage) => Promise<void>;

type StartVerificationPropsType = Pick<_UserType, "email">;
type StartVerificationReturnType = RegisterReturnType;
type StartVerificationType = (
	data: StartVerificationPropsType,
) => Promise<StartVerificationReturnType>;

type VerifyAccountPropsType = Pick<
	SessionType,
	"deviceId" | "deviceName" | "deviceType"
> & {
	id: UserType["id"];
	code: CodeType;
};
type VerifyAccountReturnType = LoginReturnType;
type VerifyAccountType = (
	data: VerifyAccountPropsType,
) => Promise<LoginReturnType>;

type UpdateProfileReturnType = Omit<LoginReturnType, "token">;
type UpdateProfileType = (
	req: IncomingMessage,
	data: Partial<{
		name: string;
		url: string;
		id: string;
	}>,
) => Promise<UpdateProfileReturnType>;

type AuthStatusReturnType =
	| TokenRefreshReturnType
	| {
			user: false;
	  };
type AuthStatusType = (req: IncomingMessage) => Promise<AuthStatusReturnType>;

type GetSessionsReturnType = {
	sessions: SessionFormatedType[];
};
type GetSessionsType = (
	req: IncomingMessage,
	props: Pick<SessionType, "deviceId">,
) => Promise<GetSessionsReturnType>;

export type {
	_UserType,
	AuthStatusReturnType,
	AuthStatusType,
	CheckAuthReturnType,
	CheckAuthType,
	GetSessionsReturnType,
	GetSessionsType,
	LoginPropsType,
	LoginRequiredReturnType,
	LoginRequiredType,
	LoginReturnType,
	LoginType,
	LogoutType,
	RegisterPropsType,
	RegisterReturnType,
	RegisterType,
	ReturnUserType,
	SafeUserType,
	StartVerificationPropsType,
	StartVerificationReturnType,
	StartVerificationType,
	TokenRefreshReturnType,
	TokenRefreshType,
	UpdateProfileReturnType,
	UpdateProfileType,
	UserModelType,
	VerifyAccountPropsType,
	VerifyAccountReturnType,
	VerifyAccountType,
};
