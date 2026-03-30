import type {
	AuthPropsType,
	AuthReturnType,
} from "@auth-guard/backend/types/index";
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
		  };
};

type AuthExpressReturnType = Record<
	keyof AuthReturnType | "me",
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

export type * from "@auth-guard/backend/types/index";
export type { AuthExpressReturnType, AuthExpressType, ResType };
