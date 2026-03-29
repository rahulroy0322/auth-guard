import type { IncomingMessage } from "node:http";
import type { UserType } from "base";
import type { CodeType } from "./code";

type SafeUserType = Omit<UserType, "password">;

type UserModelType = {
	findById: (id: UserType["id"]) => Promise<UserType | null>;
	findByEmail: (email: UserType["email"]) => Promise<UserType | null>;

	create: (
		data: Pick<UserType, "email" | "name" | "password" | "roles">,
	) => Promise<Omit<UserType, "profiles" | "avatar"> | null>;

	updateById: (
		id: UserType["id"],
		data: Partial<UserType>,
	) => Promise<Omit<UserType, "avatar" | "profiles"> | null>;
};

type RegisterPropsType = Pick<UserType, "email" | "name"> & {
	password: string;
};
type RegisterReturnType = Pick<UserType, "id">;
type RegisterType = (data: RegisterPropsType) => Promise<RegisterReturnType>;

type LoginPropsType = Pick<UserType, "email"> & {
	password: string;
};
type LoginReturnType = {
	user: Omit<UserType, "password">;
	token: {
		refresh: string;
		access: string;
	};
};
type LoginType = (data: LoginPropsType) => Promise<LoginReturnType>;

type CheckAuthReturnType = {
	user: Omit<UserType, "password"> | null;
};
type CheckAuthType = (
	req: IncomingMessage,
	reqId?: string,
) => Promise<CheckAuthReturnType>;

type LoginRequiredReturnType = Pick<LoginReturnType, "user">;
type LoginRequiredType = (
	req: IncomingMessage,
	extra?: { reqId?: string }
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

type StartVerificationPropsType = Pick<UserType, "email">;
type StartVerificationReturnType = RegisterReturnType;
type StartVerificationType = (
	data: StartVerificationPropsType,
) => Promise<StartVerificationReturnType>;

type VerifieAccountPropsType = {
	id: UserType["id"];
	code: CodeType;
};
type VerifieAccountReturnType = LoginReturnType;
type VerifieAccountType = (
	data: VerifieAccountPropsType,
) => Promise<LoginReturnType>;

type UpdateProfileReturnType = Omit<LoginReturnType, "token">;
type UpdateProfileType = (
	req: IncomingMessage,
	data: Partial<{
		name: string,
		url: string
		id: string
	}>,
) => Promise<UpdateProfileReturnType>;

type AuthStatusReturnType =
	| TokenRefreshReturnType
	| {
		user: false;
	};
type AuthStatusType = (req: IncomingMessage) => Promise<AuthStatusReturnType>;

export type {
	AuthStatusReturnType,
	AuthStatusType,
	CheckAuthReturnType,
	CheckAuthType,
	LoginPropsType,
	LoginRequiredReturnType,
	LoginRequiredType,
	LoginReturnType,
	LoginType,
	LogoutType,
	RegisterPropsType,
	RegisterReturnType,
	RegisterType,
	SafeUserType,
	StartVerificationPropsType,
	StartVerificationReturnType,
	StartVerificationType,
	TokenRefreshReturnType,
	TokenRefreshType,
	UserModelType,
	VerifieAccountPropsType,
	VerifieAccountReturnType,
	VerifieAccountType,
	UpdateProfileReturnType,
	UpdateProfileType
};
