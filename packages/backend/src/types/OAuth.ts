import type { ProviderType, SessionType } from "@auth-guard/types";
import type { OAuth } from "../OAuth/base";
import type { LoginReturnType } from "./auth";

type OAuthType<T extends ProviderType> = {
	callbackUri: string;
	providers: Partial<
		Record<
			T,
			| {
					clientId: string;
					clientSecret: string;
			  }
			| OAuth<unknown>
		>
	>;
};

type OAuthStartType<T extends ProviderType> = (provider: T) => {
	url: string;
	state: string;
	codeVerifier: string;
};

type OAuthLoginReturnType = LoginReturnType;
type OAuthLoginPropsType<T extends ProviderType> = Pick<
	SessionType,
	"deviceType" | "deviceId" | "deviceName"
> & {
	provider: T;
	state: string;
	codeVerifier: string;
};

type OAuthLoginType<T extends ProviderType> = (
	query: Partial<{
		code: string;
		state: string;
	}>,
	props: OAuthLoginPropsType<T>,
) => Promise<OAuthLoginReturnType>;

export type {
	OAuthLoginPropsType,
	OAuthLoginReturnType,
	OAuthLoginType,
	OAuthStartType,
	OAuthType,
};
