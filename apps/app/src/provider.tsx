import {
	createContext,
	type FC,
	type ReactNode,
	use,
	useCallback,
	useEffect,
	useState,
} from "react";
import { PathProvider } from "./auth/provider";

type UserType = {
	name: string;
	email: string;
	avatar?: {
		src: string;
	};
};

// TODO! dummy
const sleep = (delay: number) => new Promise((res) => setTimeout(res, delay));

type GuardContextType = {
	user: UserType | null;
	error: Error | null;
	loading: boolean;
	login: (data: unknown) => Promise<void>;
	register: (data: unknown) => Promise<void>;
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

	const login = useCallback(async (_data: unknown) => {
		setLoading(true);
		setError(null);

		try {
			await sleep(200);
			setUser({
				name: "Jhon Dow",
				email: "jhon@dow.com",
				avatar: {
					src: "/user.png",
				},
			});
		} catch (e) {
			if (e instanceof Error) {
				setError(e);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const register = useCallback(async (_data: unknown) => {
		setLoading(true);
		setError(null);

		try {
			await sleep(200);
			setUser({
				name: "Jhon Dow",
				email: "jhon@dow.com",
				avatar: {
					src: "/user.png",
				},
			});
		} catch (e) {
			if (e instanceof Error) {
				setError(e);
			}
		} finally {
			setLoading(false);
		}
	}, []);

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
				setUser({
					name: "Jhon Dow",
					email: "jhon@dow.com",
					avatar: {
						src: "/user.png",
					},
				});
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
