import {
	createContext,
	type Dispatch,
	type FC,
	type ReactNode,
	use,
	useMemo,
	useReducer,
} from "react";

type AuthPathType =
	| "register"
	| "login"
	| "verify"
	| "forgot-password"
	| "reset-password";

type ResetPasswordStateType = {
	id: string;
	email?: string;
};

type AuthFlowStateType = {
	path: AuthPathType;
	resetPasswordState: ResetPasswordStateType | null;
};

type AuthPathActionType =
	| {
			type: "set-path";
			path: AuthPathType;
	  }
	| {
			type: "set-reset-password-state";
			state: ResetPasswordStateType | null;
	  }
	| {
			type: "reset-flow";
			path?: AuthPathType;
	  };

type AuthPathContextType = AuthFlowStateType & {
	dispatch: Dispatch<AuthPathActionType>;
	setPath: (path: AuthPathType) => void;
	setResetPasswordState: (state: ResetPasswordStateType | null) => void;
	resetFlow: (path?: AuthPathType) => void;
};

const initialState: AuthFlowStateType = {
	path: "login",
	resetPasswordState: null,
};

const AuthPathContext = createContext<AuthPathContextType | null>(null);

const authPathReducer = (
	state: AuthFlowStateType,
	action: AuthPathActionType,
): AuthFlowStateType => {
	switch (action.type) {
		case "set-path":
			return {
				...state,
				path: action.path,
			};
		case "set-reset-password-state":
			return {
				...state,
				resetPasswordState: action.state,
			};
		case "reset-flow":
			return {
				path: action.path ?? "login",
				resetPasswordState: null,
			};
		default:
			return state;
	}
};

type PathProviderPropsType = {
	children: ReactNode;
};

const PathProvider: FC<PathProviderPropsType> = ({ children }) => {
	const [state, dispatch] = useReducer(authPathReducer, initialState);

	const value = useMemo<AuthPathContextType>(
		() => ({
			...state,
			dispatch,
			setPath: (path) => {
				dispatch({
					type: "set-path",
					path,
				});
			},
			setResetPasswordState: (resetPasswordState) => {
				dispatch({
					type: "set-reset-password-state",
					state: resetPasswordState,
				});
			},
			resetFlow: (path) => {
				dispatch({
					type: "reset-flow",
					path,
				});
			},
		}),
		[state],
	);

	return (
		<AuthPathContext.Provider value={value}>
			{children}
		</AuthPathContext.Provider>
	);
};

const usePath = () => {
	const context = use(AuthPathContext);

	if (!context) {
		throw new Error('"usePath" must be wrapped with "PathProvider"');
	}

	return context;
};

export type { AuthPathType, ResetPasswordStateType };

export { PathProvider, usePath };
