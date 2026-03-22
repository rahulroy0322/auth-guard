import { type FC, type ReactNode, useEffect } from "react";
import { LoginForm, RegisterForm } from "shared";
import { Button } from "ui/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "ui/components/ui/dialog";
import { toast } from "ui/components/ui/sonner";
import { useGuard } from "../provider";
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
	const { loading, login, register, error } = useGuard();
	const { path, setPath } = usePath();

	useEffect(() => {
		if (error) {
			toast.error(error.name, {
				description: error.message,
			});
		}
	}, [error]);

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
						handleSubmit={login}
						pending={loading}
					/>
				) : null}
				{path === "register" ? (
					<RegisterForm
						onClick={() => {
							setPath("login");
						}}
						handleSubmit={register}
						pending={loading}
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
