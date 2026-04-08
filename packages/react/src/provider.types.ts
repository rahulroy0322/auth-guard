import type { UserType } from "base";
import type { ReactNode } from "react";
import type { OAuthProviderOptionType } from "shared";
import type { StartVerificationReturnType } from "./api/main";

type GuardUserType = Omit<UserType, "password">;

type RegisterSchemaType = Pick<UserType, "name" | "email"> & {
	password: string;
};

type LoginSchemaType = Omit<RegisterSchemaType, "name">;

type VerificationStateType = {
	email: string;
	id: string;
};

type GuardProviderConfigType = {
	baseUrl: string;
	appName?: string;
	images: {
		login: string;
		register: string;
		verify: string;
		reset: string;
		forgot: string;
	};
};

type GuardContextType = {
	user: GuardUserType | null;
	token: string | null;
	error: Error | null;
	loading: boolean;
	fetching: boolean;
	verification: VerificationStateType | null;
	oauthProviders: OAuthProviderOptionType[];
	config: GuardProviderConfigType;
	login: (data: LoginSchemaType) => Promise<void>;
	register: (data: RegisterSchemaType) => Promise<void>;
	finishOAuth: (
		provider: OAuthProviderOptionType["provider"],
		query: {
			code: string;
			state: string;
		},
		signal: Request["signal"],
	) => Promise<void>;
	startVerification: (email: string) => Promise<StartVerificationReturnType>;
	forgotPassword: (email: string) => Promise<StartVerificationReturnType>;
	verifyAccount: (code: string) => Promise<void>;
	resetPassword: (value: {
		id: string;
		code: string;
		password: string;
	}) => Promise<void>;
	clearVerification: () => void;
	logout: () => Promise<void>;
	refreshToken: () => Promise<{ token: string }>;
	reqWithToken: <T>(cb: (token: string) => Promise<T>) => Promise<T>;
};

type GuardProviderPropsType = {
	children: ReactNode;
	oauth?: Omit<OAuthProviderOptionType, "onClick">[];
	config: GuardProviderConfigType;
};

export type {
	GuardContextType,
	GuardProviderConfigType,
	GuardProviderPropsType,
	GuardUserType,
	LoginSchemaType,
	RegisterSchemaType,
	VerificationStateType,
};
