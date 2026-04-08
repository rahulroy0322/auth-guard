import type { OAuthProviderOptionType } from "shared";
import { toast } from "ui/components/ui/sonner";
import { startLoginWithOAuthProvider } from "./api/main";
import type { VerificationStateType } from "./provider.types";

const VERIFICATION_STORAGE_KEY = "auth.verification";

const isError = (value: unknown): value is Error =>
	value instanceof Error ||
	(!!value &&
		typeof value === "object" &&
		"message" in value &&
		"name" in value);

const isVerificationState = (
	value: unknown,
): value is VerificationStateType => {
	if (!value || typeof value !== "object") {
		return false;
	}

	return (
		"email" in value &&
		typeof value.email === "string" &&
		"id" in value &&
		typeof value.id === "string"
	);
};

const readVerificationState = (): VerificationStateType | null => {
	if (typeof window === "undefined") {
		return null;
	}

	const stored = sessionStorage.getItem(VERIFICATION_STORAGE_KEY);

	if (!stored) {
		return null;
	}

	try {
		const parsed = JSON.parse(stored) as unknown;

		if (!isVerificationState(parsed)) {
			sessionStorage.removeItem(VERIFICATION_STORAGE_KEY);
			return null;
		}

		return parsed;
	} catch {
		sessionStorage.removeItem(VERIFICATION_STORAGE_KEY);
		return null;
	}
};

const clearVerificationState = () => {
	if (typeof window === "undefined") {
		return;
	}

	sessionStorage.removeItem(VERIFICATION_STORAGE_KEY);
};

const persistVerificationState = (
	verification: VerificationStateType | null,
) => {
	if (typeof window === "undefined") {
		return;
	}

	if (!verification) {
		clearVerificationState();
		return;
	}

	sessionStorage.setItem(
		VERIFICATION_STORAGE_KEY,
		JSON.stringify(verification),
	);
};

const startOAuth = async (
	baseUrl: string,
	provider: OAuthProviderOptionType["provider"],
) => {
	try {
		const { url } = await startLoginWithOAuthProvider(baseUrl, provider);
		window.location.assign(url);
	} catch (error) {
		toast.error("Failed to initiate OAuth login");
		console.error(error);
	}
};

export {
	clearVerificationState,
	isError,
	persistVerificationState,
	readVerificationState,
	startOAuth,
	VERIFICATION_STORAGE_KEY,
};
