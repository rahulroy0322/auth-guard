import type { IncomingMessage } from "node:http";
import type { UserType } from "base";

type LogType = {
	who: "[SYSTEM]" | (UserType["name"] & {});
	userId: UserType["id"] | null;
	msg: Capitalize<string>;
	reqId?: string;
	extra?: Record<string, string>;
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

type AuthPropsType = {
	User: {
		findById: (id: UserType["id"]) => Promise<UserType | null>;
		findByEmail: (email: UserType["email"]) => Promise<UserType | null>;

		create: (
			data: Pick<UserType, "email" | "name" | "password" | "roles">,
		) => Promise<UserType | null>;
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
	checkAuth: CheckAuthType;
	loginRequired: LoginRequiredType;
	tokenRefresh: TokenRefreshType;
};

type AuthType = (props: AuthPropsType) => AuthReturnType;

type RegisterPropsType = Pick<UserType, "email" | "name"> & {
	password: string;
};

type RegisterReturnType = {
	user: Omit<UserType, "pass">;
	token: {
		refresh: string;
		access: string;
	};
};

type RegisterType = (data: RegisterPropsType) => Promise<RegisterReturnType>;

type LoginPropsType = Pick<UserType, "email"> & {
	password: string;
};

type LoginType = (data: LoginPropsType) => Promise<RegisterReturnType>;

type CheckAuthReturnType = {
	user: Omit<UserType, "password"> | null;
};

type CheckAuthType = (
	req: IncomingMessage,
	reqId?: string,
) => Promise<CheckAuthReturnType>;

type LoginRequiredReturnType = {
	user: Omit<UserType, "password">;
};

type LoginRequiredType = (
	req: IncomingMessage,
) => Promise<LoginRequiredReturnType>;

type TokenRefreshType = (req: IncomingMessage) => Promise<RegisterReturnType>;

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
	LogType,
	RegisterPropsType,
	RegisterType,
	TokenRefreshType,
	TokenType,
};
