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
	getWithAccessToken,
	post,
	saveToken,
} from "./api/main";
import { PathProvider } from "./auth/provider";
import { config } from "./config";

type GuardUserType = Omit<UserType, "password">;

type RegisterSchemaType = Omit<UserType, "id" | "roles"> & {
	password: string;
};

type LoginSchemaType = Omit<RegisterSchemaType, "name">;

type GuardContextType = {
	user: GuardUserType | null;
	error: Error | null;
	loading: boolean;
	login: (data: LoginSchemaType) => Promise<void>;
	register: (data: RegisterSchemaType) => Promise<void>;
	logout: () => Promise<void>;
};

const GuardContext = createContext<GuardContextType | null>(null);

type GuardProviderPropsType = {
	children: ReactNode;
};

const GuardProviderImpl: FC<GuardProviderPropsType> = ({ children }) => {
	const [user, setUser] = useState<GuardContextType["user"]>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const req = useCallback(async (cb: () => Promise<AuthResType>) => {
		setLoading(true);
		setError(null);

		try {
			const { user, token } = await cb();

			saveToken(token);
			setUser(user);
		} catch (e) {
			if (e && typeof e === "object" && "message" in e && "name" in e) {
				setError(e as Error);
			}
			throw e;
		} finally {
			setLoading(false);
		}
	}, []);

	const login = useCallback(
		async (data: LoginSchemaType) => {
			req(async () => {
				return await post<AuthResType>({
					body: data,
					base: "http://localhost:8000",
					url: "login",
				});
			});
		},
		[req],
	);

	const register = useCallback(
		async (data: RegisterSchemaType) => {
			req(async () => {
				return await post<AuthResType>({
					body: data,
					base: "http://localhost:8000",
					url: "register",
				});
			});
		},
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: on init only
	useEffect(() => {
		if (localStorage.getItem(config.refresh)) {
			req(() =>
				getWithAccessToken<AuthResType>({
					base: "http://localhost:8000",
					url: "me",
				}),
			);
		}
	}, []);

	return (
		<GuardContext
			value={{
				user,
				error,
				loading,
				login,
				register,
				logout,
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
