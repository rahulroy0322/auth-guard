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
import { post } from "./api/main";
import { PathProvider } from "./auth/provider";
import { config } from "./config";

type GuardUserType = Omit<UserType, "password">;

type RegisterSchemaType = Omit<UserType, "id" | "roles"> & {
	password: string;
};

type LoginSchemaType = Omit<RegisterSchemaType, "name">;

// TODO! dummy
const sleep = (delay: number) => new Promise((res) => setTimeout(res, delay));

type GuardContextType = {
	user: GuardUserType | null;
	error: Error | null;
	loading: boolean;
	login: (data: LoginSchemaType) => Promise<void>;
	register: (data: RegisterSchemaType) => Promise<void>;
	logout: () => Promise<void>;
};

const GuardContext = createContext<GuardContextType | null>(null);

type AuthResType = {
	user: Omit<UserType, "password">;
	token: {
		refresh?: string;
		access: string;
	};
};

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

			if (token.refresh) {
				localStorage.setItem(config.refresh, token.refresh);
			}
			localStorage.setItem(config.access, token.access);
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
			await sleep(200);
			setUser(null);
		} catch (e) {
			if (e instanceof Error) {
				setError(e);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// simulate user is loged in
	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				await sleep(2000);
				// setUser({
				// 	id: '1',
				// 	roles: ['geast'],
				// 	name: "Jhon Dow",
				// 	email: "jhon@dow.com",
				// 	avatar: {
				// 		src: "/user.png",
				// 	},
				// });
			} catch (e) {
				setError(e as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
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

const GuardProvider: FC<GuardProviderPropsType> = ({ children }) => {
	return (
		<GuardProviderImpl>
			<PathProvider>{children}</PathProvider>
		</GuardProviderImpl>
	);
};

const useGuard = () => {
	const context = use(GuardContext);

	if (!context) {
		throw new Error('"useGuard" must be wraped with "GuardProvider"');
	}

	return context;
};

export { GuardProvider, useGuard };
