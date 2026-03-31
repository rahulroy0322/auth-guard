import type { IncomingMessage } from "node:http";
import type { SessionType, UserType } from "base";
import type {
	LoginReturnType,
	RegisterReturnType,
	VerifieAccountPropsType,
} from "./auth";

type ForgotPasswordPropsType = Pick<UserType, "email">;
type ForgotPasswordReturnType = RegisterReturnType;
type ForgotPasswordType = (
	data: ForgotPasswordPropsType,
) => Promise<ForgotPasswordReturnType>;

type ResetPasswordPropsType = VerifieAccountPropsType &
	Pick<SessionType, "deviceType" | "deviceId" | "deviceName"> & {
		password: string;
	};
type ResetPasswordReturnType = LoginReturnType;
type ResetPasswordType = (
	data: ResetPasswordPropsType,
) => Promise<ResetPasswordReturnType>;

type ChangePasswordReturnType = LoginReturnType;
type ChangePasswordType = (
	req: IncomingMessage,
	data: Pick<SessionType, "deviceId" | "deviceName" | "deviceType"> & {
		password: string;
	},
) => Promise<ChangePasswordReturnType>;

export type {
	ChangePasswordReturnType,
	ChangePasswordType,
	ForgotPasswordPropsType,
	ForgotPasswordReturnType,
	ForgotPasswordType,
	ResetPasswordPropsType,
	ResetPasswordReturnType,
	ResetPasswordType,
};
