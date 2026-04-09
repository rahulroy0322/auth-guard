export type {
	AvatarType,
	ProfileType,
	ProviderType,
	RoleType,
	SessionFormatedType as SessionType,
	UserType,
} from "base";

export type {
	AuthBaseButtonPropsType,
	LoginButtonPropsType,
	RegisterButtonPropsType,
} from "./components/main";
export {
	AuthBaseButton,
	LoginButton,
	ProfileButton,
	RegisterButton,
} from "./components/main";

export { GuardProvider, useGuard } from "./provider";
export type {
	GuardProviderConfigType,
	GuardProviderPropsType,
	GuardUserType,
	LoginSchemaType,
	RegisterSchemaType,
	VerificationStateType,
} from "./provider.types";

type OAuthProviderType = Omit<OAuthProviderOptionType, "onClick">;

export { Show } from "./utils";
export type { OAuthProviderType };

import type { OAuthProviderOptionType } from "shared";
import "./style.css";
