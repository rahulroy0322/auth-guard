import {
	createContext,
	type FC,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Toaster } from "ui/components/ui/sonner";
import { type AuthResType, type AuthStatusReturnType, get } from "./api/main";
import { PathProvider } from "./components/provider";
import { createAuthActions } from "./core/actions";
import { createAuthClient } from "./core/client";
import { applyAuthState as applyResolvedAuthState } from "./core/state";
import type {
	GuardContextType,
	GuardProviderConfigType,
	GuardProviderPropsType,
	GuardUserType,
	LoginSchemaType,
	RegisterSchemaType,
	VerificationStateType,
} from "./provider.types";
import {
	isError,
	persistVerificationState,
	readVerificationState,
	startOAuth,
} from "./provider.utils";

const GuardContext = createContext<GuardContextType | null>(null);

const GuardProviderImpl: FC<GuardProviderPropsType> = ({
	children,
	config,
	oauth = [],
}) => {
	const oauthProviders = useMemo(() => {
		return oauth.map((option) => ({
			...option,
			onClick: () => startOAuth(config.baseUrl, option.provider),
		}));
	}, [config.baseUrl, oauth]);

	const [user, setUser] = useState<GuardContextType["user"]>(null);
	const [token, setToken] = useState<GuardContextType["token"]>(null);
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [verification, setVerification] =
		useState<VerificationStateType | null>(() => readVerificationState());

	const withFetchingState = useCallback(
		async <T,>(
			operation: () => Promise<T>,
			onError?: (error: Error) => Promise<void> | void,
		): Promise<T> => {
			setFetching(true);
			setError(null);

			try {
				return await operation();
			} catch (caughtError) {
				if (isError(caughtError)) {
					if (onError) {
						await onError(caughtError);
					} else {
						setError(caughtError);
					}
				}

				throw caughtError;
			} finally {
				setFetching(false);
			}
		},
		[],
	);

	useEffect(() => {
		const checkAuth = async () => {
			setLoading(true);

			try {
				const status = await get<AuthStatusReturnType>({
					base: config.baseUrl,
					url: "status",
				});

				if (status.authenticated) {
					setToken(status.token);
					setUser(status.user);
				} else {
					setToken(null);
					setUser(null);
				}
			} catch (caughtError) {
				console.error("Auth check failed:", caughtError);
				setToken(null);
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [config.baseUrl]);

	useEffect(() => {
		persistVerificationState(verification);
	}, [verification]);

	const clearVerification = useCallback(() => {
		setVerification(null);
	}, []);

	const applyAuthState = useCallback((auth: AuthResType) => {
		applyResolvedAuthState(auth, {
			setToken,
			setUser,
			setVerification,
		});
	}, []);

	const authClient = useMemo(
		() =>
			createAuthClient({
				baseUrl: config.baseUrl,
				setError,
				setFetching,
				setToken,
				setUser,
				token,
				withFetchingState,
			}),
		[config.baseUrl, token, withFetchingState],
	);

	const authActions = useMemo(
		() =>
			createAuthActions({
				applyAuthState,
				baseUrl: config.baseUrl,
				setError,
				setLoading,
				setToken,
				setUser,
				setVerification,
				verification,
				withFetchingState,
			}),
		[applyAuthState, config.baseUrl, verification, withFetchingState],
	);

	const value = useMemo<GuardContextType>(
		() => ({
			...authActions,
			...authClient,
			config,
			user,
			token,
			error,
			loading,
			fetching,
			verification,
			oauthProviders,
			clearVerification,
		}),
		[
			clearVerification,
			config,
			error,
			fetching,
			loading,
			oauthProviders,
			token,
			user,
			verification,
			authActions,
			authClient,
		],
	);

	return (
		<GuardContext.Provider value={value}>{children}</GuardContext.Provider>
	);
};

const GuardProvider: FC<GuardProviderPropsType> = ({ children, ...props }) => (
	<>
		<GuardProviderImpl {...props}>
			<PathProvider>{children}</PathProvider>
		</GuardProviderImpl>
		<Toaster richColors closeButton />
	</>
);

const useGuard = () => {
	const context = use(GuardContext);

	if (!context) {
		throw new Error('"useGuard" must be wrapped with "GuardProvider"');
	}

	return context;
};

export type {
	GuardProviderConfigType,
	GuardProviderPropsType,
	GuardUserType,
	LoginSchemaType,
	RegisterSchemaType,
	VerificationStateType,
};

export { GuardProvider, useGuard };
