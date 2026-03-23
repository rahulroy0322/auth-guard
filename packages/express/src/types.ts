import type { AuthPropsType } from "@auth-guard/backend/types";
import type { UserType } from "base";
import type { RequestHandler } from "express";

type AuthExpressPropsType = AuthPropsType & {
	cookie: {
		refresh: string;
		access: string;
	};
};

type ResType = {
	success: true;
	data:
		| {
				user: Omit<UserType, "password">;
				token?: {
					refresh?: string;
					access: string;
				};
		  }
		| {
				id?: string;
				message: string;
		  };
};

type AuthExpressReturnType = Record<
	| "login"
	| "register"
	| "checkAuth"
	| "loginRequired"
	| "tokenRefresh"
	| "me"
	| "logout"
	| "startVerification"
	| "verifieAccount",
	RequestHandler
>;

type AuthExpressType = (props: AuthExpressPropsType) => AuthExpressReturnType;

declare global {
	namespace Express {
		interface Request {
			user?: Omit<UserType, "password">;
		}
	}
}

export type * from "@auth-guard/backend/types";
export type { AuthExpressReturnType, AuthExpressType, ResType };
