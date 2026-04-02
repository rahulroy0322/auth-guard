import { createContext, type FC, type ReactNode, use, useState } from "react";

type AuthPathsType = "register" | "login" | "verify";

type AuthPathContextType = {
	path: AuthPathsType;
	setPath: (path: AuthPathsType) => void;
};

const AuthPathContext = createContext<AuthPathContextType | null>(null);

type GuardProviderPropsType = {
	children: ReactNode;
};

const PathProvider: FC<GuardProviderPropsType> = ({ children }) => {
	const [path, setPath] = useState<AuthPathContextType["path"]>("login");

	return (
		<AuthPathContext
			value={{
				path,
				setPath,
			}}
		>
			{children}
		</AuthPathContext>
	);
};

const usePath = () => {
	const context = use(AuthPathContext);

	if (!context) {
		throw new Error('"usePath" must be wraped with "PathProvider"');
	}

	return context;
};

export type { AuthPathsType };

export { PathProvider, usePath };
