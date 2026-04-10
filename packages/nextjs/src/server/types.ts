import type {
	AuthPropsType,
	AuthReturnType,
} from "@auth-guard/backend/types/main";
import type { ProviderType, SessionType, UserType } from "@auth-guard/react";
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

export * from "@auth-guard/backend/types";
export type { HandleAuthPropsType, HandleAuthType, HandlerType, ResType };
