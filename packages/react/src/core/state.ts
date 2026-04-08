import type { UserType } from "base";
import type { Dispatch, SetStateAction } from "react";
import type { AuthResType } from "../api/main";
import type {
	GuardContextType,
	VerificationStateType,
} from "../provider.types";

type GuardStateSetterType<T> = Dispatch<SetStateAction<T>>;

type AuthStateSettersType = {
	setError: GuardStateSetterType<Error | null>;
	setToken: GuardStateSetterType<GuardContextType["token"]>;
	setUser: GuardStateSetterType<GuardContextType["user"]>;
	setVerification: GuardStateSetterType<VerificationStateType | null>;
};

const applyAuthState = (
	auth: AuthResType,
	{
		setToken,
		setUser,
		setVerification,
	}: Pick<AuthStateSettersType, "setToken" | "setUser" | "setVerification">,
) => {
	setUser(auth.user);

	if (auth.token) {
		setToken(auth.token);
	}

	setVerification(null);
};

const clearAuthState = ({
	setToken,
	setUser,
	setVerification,
}: Pick<AuthStateSettersType, "setToken" | "setUser" | "setVerification">) => {
	setUser(null);
	setToken(null);
	setVerification(null);
};

const syncAuthResult = <T>(
	data: T,
	{ setToken, setUser }: Pick<AuthStateSettersType, "setToken" | "setUser">,
) => {
	if (!data || typeof data !== "object") {
		return data;
	}

	if ("user" in data) {
		setUser(data.user as UserType);
	}

	if ("token" in data && typeof data.token === "string") {
		setToken(data.token);
	}

	return data;
};

export type { AuthStateSettersType };

export { applyAuthState, clearAuthState, syncAuthResult };
