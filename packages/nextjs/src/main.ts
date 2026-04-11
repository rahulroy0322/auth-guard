"use client";
export type {
	AuthBaseButtonPropsType,
	AvatarType,
	GuardProviderConfigType,
	GuardProviderPropsType,
	GuardUserType,
	LoginButtonPropsType,
	LoginSchemaType,
	OAuthProviderType,
	ProfileType,
	ProviderType,
	RegisterButtonPropsType,
	RegisterSchemaType,
	RoleType,
	SessionType,
	UserType,
	VerificationStateType,
} from "@auth-guard/react";

export {
	AuthBaseButton,
	GuardProvider,
	LoginButton,
	ProfileButton,
	RegisterButton,
	Show,
	useGuard,
} from "@auth-guard/react";
export type * from "./server/types";
import "@auth-guard/react/styles.css";
