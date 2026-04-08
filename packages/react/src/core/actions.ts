import type { Dispatch, SetStateAction } from "react";
import { toast } from "ui/components/ui/sonner";
import {
	type AuthResType,
	forgotPassword as forgotPasswordRequest,
	loginWithOAuthProvider,
	post,
	resetPassword as resetPasswordRequest,
	type StartVerificationReturnType,
	startVerification as startVerificationRequest,
	verifyAccount as verifyAccountRequest,
} from "../api/main";
import type {
	GuardContextType,
	VerificationStateType,
} from "../provider.types";
import { type AuthStateSettersType, clearAuthState } from "./state";

type WithFetchingStateType = <T>(
	operation: () => Promise<T>,
	onError?: (error: Error) => Promise<void> | void,
) => Promise<T>;

type CreateAuthActionsParamsType = Pick<
	AuthStateSettersType,
	"setError" | "setToken" | "setUser" | "setVerification"
> & {
	applyAuthState: (auth: AuthResType) => void;
	baseUrl: string;
	setLoading: Dispatch<SetStateAction<boolean>>;
	verification: VerificationStateType | null;
	withFetchingState: WithFetchingStateType;
};

const createAuthActions = ({
	applyAuthState,
	baseUrl,
	setError,
	setLoading,
	setToken,
	setUser,
	setVerification,
	verification,
	withFetchingState,
}: CreateAuthActionsParamsType) => {
	const startVerification: GuardContextType["startVerification"] = async (
		email,
	) => {
		return withFetchingState(async () => {
			const result = await startVerificationRequest(baseUrl, email);

			setVerification({
				email,
				id: result.id,
			});

			return result;
		});
	};

	const forgotPassword: GuardContextType["forgotPassword"] = async (email) => {
		return withFetchingState(async () => {
			return forgotPasswordRequest(baseUrl, {
				email,
			});
		});
	};

	const verifyAccount: GuardContextType["verifyAccount"] = async (code) => {
		if (!verification) {
			const verificationError = new Error("Verification session not found");
			verificationError.name = "AuthVerificationStateError";
			setError(verificationError);
			throw verificationError;
		}

		return withFetchingState(async () => {
			const auth = await verifyAccountRequest(baseUrl, {
				id: verification.id,
				code,
			});
			applyAuthState(auth);
		});
	};

	const resetPassword: GuardContextType["resetPassword"] = async (value) => {
		return withFetchingState(async () => {
			const auth = await resetPasswordRequest(baseUrl, value);
			applyAuthState(auth);
		});
	};

	const startVerificationIfNeeded = async (authError: Error, email: string) => {
		if (authError.name === "AuthNotVerifiedError") {
			await startVerification(email);
			return;
		}

		setError(authError);
	};

	const finishOAuth: GuardContextType["finishOAuth"] = async (
		provider,
		query,
		signal,
	) => {
		return withFetchingState(async () => {
			const auth = await loginWithOAuthProvider(
				baseUrl,
				provider,
				query,
				signal,
			);
			applyAuthState(auth);
			toast.success("Login successful");
		});
	};

	const login: GuardContextType["login"] = async (data) => {
		return withFetchingState(
			async () => {
				const auth = await post<AuthResType>({
					body: data,
					base: baseUrl,
					url: "login",
				});
				applyAuthState(auth);
			},
			async (authError) => {
				await startVerificationIfNeeded(authError, data.email);
			},
		);
	};

	const register: GuardContextType["register"] = async (data) => {
		return withFetchingState(
			async () => {
				const { id } = await post<StartVerificationReturnType>({
					body: data,
					base: baseUrl,
					url: "register",
				});
				setVerification({
					email: data.email,
					id,
				});
			},
			async (authError) => {
				await startVerificationIfNeeded(authError, data.email);
			},
		);
	};

	const logout: GuardContextType["logout"] = async () => {
		setLoading(true);
		setError(null);

		try {
			await post({
				base: baseUrl,
				body: {},
				url: "logout",
			});
			toast.success("Logout successful");
		} catch (caughtError) {
			if (caughtError instanceof Error) {
				setError(caughtError);
			}
			console.error(caughtError);
			toast.error("Logout failed");
		} finally {
			setLoading(false);
			clearAuthState({
				setToken,
				setUser,
				setVerification,
			});
		}
	};

	return {
		finishOAuth,
		forgotPassword,
		login,
		logout,
		register,
		resetPassword,
		startVerification,
		verifyAccount,
	};
};

export { createAuthActions };
