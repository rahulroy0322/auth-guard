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
} from "./api/main";
import { PathProvider } from "./auth/provider";
import { config } from "./config";

type GuardUserType = Omit<UserType, "password">;

type RegisterSchemaType = Pick<UserType, "name" | "email"> & {
	password: string;
};

type LoginSchemaType = Omit<RegisterSchemaType, "name">;

const isError = (value: unknown): value is Error =>
	value instanceof Error ||
	(!!value &&
		typeof value === "object" &&
		"message" in value &&
		"name" in value);

type GuardContextType = {
	user: GuardUserType | null;
	token: string | null;
	error: Error | null;
	loading: boolean;
	fetching: boolean;
	login: (data: LoginSchemaType) => Promise<void>;
	register: (data: RegisterSchemaType) => Promise<void>;
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

	const req = useCallback(async (cb: () => Promise<AuthResType>) => {
		setFetching(true);
		setError(null);

		try {
			const { user } = await cb();
			setUser(user);
		} catch (e) {
			if (isError(e)) {
				setError(e);
			} else {
				throw e;
			}
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

				if (e?.name !== "AuthExpiredError") {
					throw e;
				}

				const { token: newToken } = await refreshToken();
				data = await cb(newToken);
			} finally {
				setFetching(false);
			}

			if (data) {
				if (typeof data === "object") {
					if ("user" in data) {
						setUser(data.user as UserType);
					}
					if ("token" in data) {
						setToken(data.token as string);
					}
				}
			}
			return data;
		},
		[token, refreshToken],
	);

	const login = useCallback(
		(data: LoginSchemaType) =>
			req(async () =>
				post<AuthResType>({
					body: data,
					base: config.base,
					url: "login",
				}),
			),
		[req],
	);

	const register = useCallback(
		(data: RegisterSchemaType) =>
			req(async () =>
				post<AuthResType>({
					body: data,
					base: config.base,
					url: "register",
				}),
			),
		[req],
	);

	const logout = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// ! TODO
			setUser(null);
		} catch (e) {
			if (e instanceof Error) {
				setError(e);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<GuardContext
			value={{
				user,
				token,
				error,
				loading,
				fetching,
				login,
				register,
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
