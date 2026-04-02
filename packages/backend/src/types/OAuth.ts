import type { ProviderType, SessionType } from "base";
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
};

type OAuthLoginReturnType = LoginReturnType;
type OAuthLoginPropsType<T extends ProviderType> = Pick<
	SessionType,
	"deviceType" | "deviceId" | "deviceName"
> & {
	provider: T;
};

type OAuthLoginType<T extends ProviderType> = (
	query: Partial<{
		code: string;
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
