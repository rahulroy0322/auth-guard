import { type FC, type ReactNode, useEffect } from "react";
import { LoginForm, RegisterForm, VerifyForm } from "shared";
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
	children,
	...props
}) => {
	const {
		fetching,
		login,
		register,
		error,
		verification,
		verifyAccount,
		startVerification,
		clearVerification,
	} = useGuard();
	const { path, setPath } = usePath();

	useEffect(() => {
		if (error) {
			toast.error(error.name, {
				description: error.message,
			});
		}
	}, [error]);

	useEffect(() => {
		if (!verification) {
			return;
		}

		setPath("verify");
	}, [setPath, verification]);

	return (
		<Dialog>
			<DialogTrigger
				render={<Button {...props} />}
				onClick={(event) => {
					props.onClick?.(event);
					setPath(defaultState);
				}}
			>
				{children}
			</DialogTrigger>
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
						pending={fetching}
					/>
				) : null}
				{path === "register" ? (
					<RegisterForm
						onClick={() => {
							setPath("login");
						}}
						handleSubmit={register}
						pending={fetching}
					/>
				) : null}
				{path === "verify" && verification ? (
					<VerifyForm
						email={verification.email}
						handleSubmit={verifyAccount}
						handleResend={async () => {
							await startVerification(verification.email);
						}}
						handleBack={() => {
							clearVerification();
							setPath("login");
						}}
						pending={fetching}
					/>
				) : null}
			</DialogContent>
		</Dialog>
	);
};

const AuthBaseButton: FC<AuthBaseButtonPropsType> = ({
	mode = "model",
	defaultState,
	...props
}) => {
	if (mode === "page") {
		return <Button {...props} />;
	}

	return <AuthModelBaseButton defaultState={defaultState} {...props} />;
};

export type { AuthBaseButtonPropsType };

export { AuthBaseButton };
