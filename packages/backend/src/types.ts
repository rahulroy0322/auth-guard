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

type CacheKeyType = `token:${string}`;

type AuthPropsType = {
	User: {
		findById: (id: UserType["id"]) => Promise<UserType | null>;
		findByEmail: (email: UserType["email"]) => Promise<UserType | null>;

		create: (
			data: Pick<UserType, "email" | "name" | "password" | "roles">,
		) => Promise<Omit<UserType, 'profiles' | 'avatar'> | null>;
	};
	Cache: {
		set: (key: CacheKeyType, value: string, seconds: number) => Promise<void>;
		get: (key: CacheKeyType) => Promise<string | null>;
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
	checkAuth: CheckAuthType;
	loginRequired: LoginRequiredType;
	tokenRefresh: TokenRefreshType;
};

type AuthType = (props: AuthPropsType) => AuthReturnType;

type RegisterPropsType = Pick<UserType, "email" | "name"> & {
	password: string;
};

type RegisterReturnType = {
	user: Omit<UserType, "password">;
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

type LoginRequiredReturnType = Pick<RegisterReturnType, 'user'>;

type LoginRequiredType = (
	req: IncomingMessage,
) => Promise<LoginRequiredReturnType>;

type TokenRefreshType = (req: IncomingMessage) => Promise<RegisterReturnType>;

type LogoutType = (req: IncomingMessage) => Promise<void>;

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
	TokenRefreshType,
	TokenType,
};
