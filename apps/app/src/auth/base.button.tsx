import { type FC, type ReactNode, useEffect } from "react";
import { LoginForm, RegisterForm } from "shared";
import { Button } from "ui/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "ui/components/ui/dialog";
import { type AuthPathsType, usePath } from "./provider";

type AuthBaseButtonPropsType = {
	children: ReactNode;
	defaultState: AuthPathsType;
	mode?: "model" | "page";
} & Parameters<typeof Button>[0];

const AuthModelBaseButton: FC<Omit<AuthBaseButtonPropsType, "mode">> = ({
	defaultState,
	...props
}) => {
	const { path, setPath } = usePath();

	return (
		<Dialog>
			<DialogTrigger {...props} />
			<DialogContent
				className="max-w-sm md:max-w-4xl p-0"
				showCloseButton={false}
			>
				{path === "login" ? (
					<LoginForm
						onClick={() => {
							setPath("register");
						}}
					/>
				) : null}
				{path === "register" ? (
					<RegisterForm
						onClick={() => {
							setPath("login");
						}}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
};

// got error in hook
const AuthBaseButtonImpl: FC<Omit<AuthBaseButtonPropsType, "mode">> = ({
	defaultState,
	...props
}) => {
	const { setPath } = usePath();
	useEffect(() => {
		setPath(defaultState);
	}, [defaultState, setPath]);

	return <AuthModelBaseButton defaultState={defaultState} {...props} />;
};

const AuthBaseButton: FC<AuthBaseButtonPropsType> = ({
	mode = "model",
	...props
}) => {
	if (mode === "page") {
		return <Button {...props} />;
	}

	return <AuthBaseButtonImpl {...props} />;
};

export type { AuthBaseButtonPropsType };

export { AuthBaseButton };
