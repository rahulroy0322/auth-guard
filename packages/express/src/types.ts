import type { AuthPropsType, UserType } from "@auth-guard/backend/types";
import type { RequestHandler } from "express";

type AuthExpressPropsType = AuthPropsType & {
	cookie: {
		refresh: string;
		access: string;
	};
};

type ResType = {
	success: true;
	data: {
		user: Omit<UserType, "pass">;
		token: {
			refresh?: string;
			access: string;
		};
	};
};

type AuthExpressReturnType = Record<
	"login" | "register" | "checkAuth" | "loginRequired" | "tokenRefresh",
	RequestHandler
>;

type AuthExpressType = (props: AuthExpressPropsType) => AuthExpressReturnType;

declare global {
	namespace Express {
		interface Request {
			user?: Omit<UserType, "pass">;
		}
	}
}

export type * from "@auth-guard/backend/types";
export type { AuthExpressReturnType, AuthExpressType, ResType };
