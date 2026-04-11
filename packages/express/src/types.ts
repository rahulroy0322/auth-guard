import type {
	AuthPropsType,
	AuthReturnType,
	ProviderType,
	SessionType,
	UserType,
} from "@auth-guard/backend";
import type { Request, RequestHandler } from "express";

type AuthExpressPropsType<T extends ProviderType> = AuthPropsType<T> & {
	cookie: {
		refresh: string;
		access: string;
		authState?: string;
		authVerifier?: string;
		extract: (req: Request, key: "deviceId") => string | null;
	};
};

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

type AuthExpressReturnType<T extends ProviderType> = Record<
	Exclude<keyof AuthReturnType<T>, "oAuthStart" | "loginWithProvider"> | "me",
	RequestHandler
> &
	Record<
		"oAuthStart" | "loginWithProvider",
		RequestHandler<{
			provider: T;
		}>
	>;

type AuthExpressType = <T extends ProviderType>(
	props: AuthExpressPropsType<T>,
) => AuthExpressReturnType<T>;

declare global {
	namespace Express {
		interface Request {
			user?: Omit<UserType, "password">;
		}
	}
}

export type * from "@auth-guard/backend/types";
export type {
	AuthExpressPropsType,
	AuthExpressReturnType,
	AuthExpressType,
	ResType,
};
