import type { ProfileType, ProviderType, SessionType } from "base";
import type { LoginReturnType } from "./auth";

type ProfileModelType = {
	findByUserId: (userId: ProfileType["userId"]) => Promise<ProfileType[]>;

	create: (data: ProfileType) => Promise<ProfileType | null>;

	update: (
		pk: Pick<ProfileType, "provider" | "userId">,
		data: Partial<ProfileType>,
	) => Promise<ProfileType | null>;
};

type LoginWithProviderPropsType = Pick<
	SessionType,
	"deviceType" | "deviceId" | "deviceName"
> & {
	provider: ProviderType;
	email: string;
	avatarUrl: string | null;
	name: string;
};
type LoginWithProviderReturnType = LoginReturnType;
type LoginWithProviderType = (
	data: LoginWithProviderPropsType,
) => Promise<LoginWithProviderReturnType>;

export type {
	LoginWithProviderPropsType,
	LoginWithProviderReturnType,
	LoginWithProviderType,
	ProfileModelType,
};
