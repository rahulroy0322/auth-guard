import type { IncomingMessage } from "node:http";
import type { UserType } from "base";

type LogType = {
	who: "[SYSTEM]" | (UserType["name"] & {});
	userId: UserType["id"] | null;
	msg: Capitalize<string>;
	reqId?: string;
	extra?: Record<string, unknown>;
};

type LoggerFnType = (
	data: LogType | Record<string, unknown>,
	msg?: string,
) => void;

type LoggerType = {
	info: LoggerFnType;
	error: LoggerFnType;
	trace: LoggerFnType;
};

type CodeType = string;

type CacheKeyType = `${"token" | "code"}:${string}`;

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

type AuthPropsType = {
	User: UserModelType;
	Cache: {
		set: (key: CacheKeyType, value: string, seconds: number) => Promise<void>;
		get: (key: CacheKeyType) => Promise<string | null>;
		remove: (key: CacheKeyType) => Promise<void>;
	};
	Mail: {
		sendMail: (code: CodeType) => Promise<void>;
	};
	extractToken: {
		access: (req: IncomingMessage) => string | null;
		refresh: (req: IncomingMessage) => string | null;
	};
	jwt: {
		expires: {
			access: number;
			refresh: number;
		};
		secret: string;
	};
	logger: LoggerType;
};

type AuthReturnType = {
	login: LoginType;
	register: RegisterType;
	logout: LogoutType;
	startVerification: StartVerificationType;
	verifieAccount: VerifieAccountType;
	checkAuth: CheckAuthType;
	loginRequired: LoginRequiredType;
	tokenRefresh: TokenRefreshType;
};

type AuthType = (props: AuthPropsType) => AuthReturnType;

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
) => Promise<LoginRequiredReturnType>;

type TokenRefreshType = (req: IncomingMessage) => Promise<LoginReturnType>;

type LogoutType = (req: IncomingMessage) => Promise<void>;

type StartVerificationPropsType = Pick<UserType, "email">;

type StartVerificationType = (
	data: StartVerificationPropsType,
) => Promise<RegisterReturnType>;

type VerifieAccountPropsType = {
	id: UserType["id"];
	code: CodeType;
};

type VerifieAccountType = (
	data: VerifieAccountPropsType,
) => Promise<LoginReturnType>;

type TokenType = Pick<UserType, "id"> & {
	type: "refresh" | "access";
};

export type {
	AuthPropsType,
	AuthType,
	CheckAuthType,
	LoginPropsType,
	LoginRequiredType,
	LoginType,
	LogoutType,
	LogType,
	RegisterPropsType,
	RegisterType,
	StartVerificationType,
	TokenRefreshType,
	TokenType,
	VerifieAccountType,
};
