import { createContext, type FC, type ReactNode, use, useState } from "react";

type AuthPathsType =
	| "register"
	| "login"
	| "verify"
	| "forgot-password"
	| "reset-password";

type ResetPasswordStateType = {
	id: string;
	email?: string;
};

type AuthPathContextType = {
	path: AuthPathsType;
	setPath: (path: AuthPathsType) => void;
	resetPasswordState: ResetPasswordStateType | null;
	setResetPasswordState: (state: ResetPasswordStateType | null) => void;
};

const AuthPathContext = createContext<AuthPathContextType | null>(null);

type PathProviderPropsType = {
	children: ReactNode;
};

const PathProvider: FC<PathProviderPropsType> = ({ children }) => {
	const [path, setPath] = useState<AuthPathContextType["path"]>("login");
	const [resetPasswordState, setResetPasswordState] =
		useState<AuthPathContextType["resetPasswordState"]>(null);

	return (
		<AuthPathContext
			value={{
				path,
				setPath,
				resetPasswordState,
				setResetPasswordState,
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

export type { AuthPathsType, ResetPasswordStateType };

export { PathProvider, usePath };
