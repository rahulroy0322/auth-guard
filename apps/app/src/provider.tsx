import type { UserType } from "base";
import {
	createContext,
	type FC,
	type ReactNode,
	use,
	useCallback,
	useEffect,
	useState,
} from "react";

import {
	type AuthResType,
	type AuthStatusReturnType,
	get,
	post,
	type StartVerificationReturnType,
	startVerification as startVerificationRequest,
	verifyAccount as verifyAccountRequest,
} from "./api/main";
import { PathProvider } from "./auth/provider";
import { config } from "./config";

type GuardUserType = Omit<UserType, "password">;

type RegisterSchemaType = Pick<UserType, "name" | "email"> & {
	password: string;
};

type LoginSchemaType = Omit<RegisterSchemaType, "name">;

type VerificationStateType = {
	email: string;
	id: string;
};

const VERIFICATION_STORAGE_KEY = "auth.verification";

const isError = (value: unknown): value is Error =>
	value instanceof Error ||
	(!!value &&
		typeof value === "object" &&
		"message" in value &&
		"name" in value);

const readVerificationState = (): VerificationStateType | null => {
	const stored = sessionStorage.getItem(VERIFICATION_STORAGE_KEY);

	if (!stored) {
		return null;
	}

	try {
		return JSON.parse(stored) as VerificationStateType;
	} catch {
		sessionStorage.removeItem(VERIFICATION_STORAGE_KEY);
		return null;
	}
};

type GuardContextType = {
	user: GuardUserType | null;
	token: string | null;
	error: Error | null;
	loading: boolean;
	fetching: boolean;
	verification: VerificationStateType | null;
	login: (data: LoginSchemaType) => Promise<void>;
	register: (data: RegisterSchemaType) => Promise<void>;
	startVerification: (email: string) => Promise<StartVerificationReturnType>;
	verifyAccount: (code: string) => Promise<void>;
	clearVerification: () => void;
	logout: () => Promise<void>;
	refreshToken: () => Promise<{ token: string }>;
	reqWithToken: <T>(cb: (token: string) => Promise<T>) => Promise<T>;
};

const GuardContext = createContext<GuardContextType | null>(null);

type GuardProviderPropsType = {
	children: ReactNode;
};

const GuardProviderImpl: FC<GuardProviderPropsType> = ({ children }) => {
	const [user, setUser] = useState<GuardContextType["user"]>(null);
	const [token, setToken] = useState<GuardContextType["token"]>(null);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [verification, setVerification] = useState<
		GuardContextType["verification"]
	>(() => readVerificationState());

	useEffect(() => {
		const checkAuth = async () => {
			setLoading(true);
			try {
				const status = await get<AuthStatusReturnType>({
					base: config.base,
					url: "status",
				});

				if (status.authenticated) {
					setToken(status.token);
					setUser(status.user);
				}
			} catch (e) {
				console.error("Auth check failed:", e);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	useEffect(() => {
		if (!verification) {
			sessionStorage.removeItem(VERIFICATION_STORAGE_KEY);
			return;
		}

		sessionStorage.setItem(
			VERIFICATION_STORAGE_KEY,
			JSON.stringify(verification),
		);
	}, [verification]);

	const clearVerification = useCallback(() => {
		setVerification(null);
	}, []);

	const applyAuthState = useCallback(
		(data: AuthResType) => {
			setUser(data.user);
			if (data.token?.access) {
				setToken(data.token.access);
			}
			clearVerification();
		},
		[clearVerification],
	);

	const refreshToken = useCallback(async () => {
		setFetching(true);
		setError(null);

		try {
			const { token } = await get<{
				token: string;
			}>({
				base: config.base,
				url: "refresh",
			});
			setToken(token);
			return {
				token,
			};
		} catch (e) {
			if (isError(e)) {
				setError(e);
			}
			throw e;
		} finally {
			setFetching(false);
		}
	}, []);

	const startVerification = useCallback(async (email: string) => {
		setFetching(true);
		setError(null);

		try {
			const data = await startVerificationRequest(config.base, email);
			setVerification({
				email,
				id: data.id,
			});
			return data;
		} catch (e) {
			if (isError(e)) {
				setError(e);
			}
			throw e;
		} finally {
			setFetching(false);
		}
	}, []);

	const reqWithToken = useCallback(
		async <T,>(cb: (token: string) => Promise<T>) => {
			setFetching(true);
			setError(null);
			let data: T | null = null;
			try {
				let currenToken = token;
				if (!currenToken) {
					currenToken = (await refreshToken()).token;
				}
				data = await cb(currenToken);
			} catch (e) {
				if (!isError(e)) {
					throw e;
				}

				if (e.name !== "AuthExpiredError") {
					throw e;
				}

				const { token: newToken } = await refreshToken();
				data = await cb(newToken);
			} finally {
				setFetching(false);
			}

			if (data && typeof data === "object") {
				if ("user" in data) {
					setUser(data.user as UserType);
				}
				if ("token" in data && data.token && typeof data.token === "object") {
					const tokenData = data.token as {
						access?: string;
					};
					if (tokenData.access) {
						setToken(tokenData.access);
					}
				}
			}

			return data;
		},
		[token, refreshToken],
	);

	const verifyAccount = useCallback(
		async (code: string) => {
			if (!verification) {
				const verificationError = new Error("Verification session not found");
				verificationError.name = "AuthVerificationStateError";
				setError(verificationError);
				throw verificationError;
			}

			setFetching(true);
			setError(null);

			try {
				const auth = await verifyAccountRequest(config.base, {
					id: verification.id,
					code,
				});
				applyAuthState(auth);
			} catch (e) {
				if (isError(e)) {
					setError(e);
				}
				throw e;
			} finally {
				setFetching(false);
			}
		},
		[applyAuthState, verification],
	);

	const login = useCallback(
		async (data: LoginSchemaType) => {
			setFetching(true);
			setError(null);

			try {
				const auth = await post<AuthResType>({
					body: data,
					base: config.base,
					url: "login",
				});
				applyAuthState(auth);
			} catch (e) {
				if (!isError(e)) {
					throw e;
				}

				if (e.name === "AuthNotVerifiedError") {
					const verificationData = await startVerificationRequest(
						config.base,
						data.email,
					);
					setVerification({
						email: data.email,
						id: verificationData.id,
					});
					return;
				}

				setError(e);
			} finally {
				setFetching(false);
			}
		},
		[applyAuthState],
	);

	const register = useCallback(async (data: RegisterSchemaType) => {
		setFetching(true);
		setError(null);

		try {
			await post<StartVerificationReturnType>({
				body: data,
				base: config.base,
				url: "register",
			});
			const verificationData = await startVerificationRequest(
				config.base,
				data.email,
			);
			setVerification({
				email: data.email,
				id: verificationData.id,
			});
		} catch (e) {
			if (!isError(e)) {
				throw e;
			}

			if (e.name === "AuthNotVerifiedError") {
				const verificationData = await startVerificationRequest(
					config.base,
					data.email,
				);
				setVerification({
					email: data.email,
					id: verificationData.id,
				});
				return;
			}

			setError(e);
		} finally {
			setFetching(false);
		}
	}, []);

	const logout = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			setUser(null);
			setToken(null);
			clearVerification();
		} catch (e) {
			if (e instanceof Error) {
				setError(e);
			}
		} finally {
			setLoading(false);
		}
	}, [clearVerification]);

	return (
		<GuardContext
			value={{
				user,
				token,
				error,
				loading,
				fetching,
				verification,
				login,
				register,
				startVerification,
				verifyAccount,
				clearVerification,
				logout,
				refreshToken,
				reqWithToken,
			}}
		>
			{children}
		</GuardContext>
	);
};

const GuardProvider: FC<GuardProviderPropsType> = ({ children }) => (
	<GuardProviderImpl>
		<PathProvider>{children}</PathProvider>
	</GuardProviderImpl>
);

const useGuard = () => {
	const context = use(GuardContext);

	if (!context) {
		throw new Error('"useGuard" must be wraped with "GuardProvider"');
	}

	return context;
};

export type { GuardUserType };

export { GuardProvider, useGuard };
