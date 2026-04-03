import { type FC, type ReactNode, useEffect } from "react";
import {
	ForgotPasswordForm,
	LoginForm,
	RegisterForm,
	ResetPasswordForm,
	VerifyForm,
} from "shared";
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
		config,
		fetching,
		login,
		register,
		error,
		oauthProviders,
		verification,
		forgotPassword,
		verifyAccount,
		resetPassword,
		startVerification,
		clearVerification,
	} = useGuard();
	const { path, setPath, resetPasswordState, setResetPasswordState } =
		usePath();

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
				className="max-w-sm md:max-w-4xl p-0 "
				showCloseButton={false}
			>
				{path === "login" ? (
					<LoginForm
						src={config.images.login}
						appName={config.appName}
						onClick={() => {
							setPath("register");
						}}
						forgotPasswordProps={{
							onClick: () => {
								setPath("forgot-password");
							},
						}}
						handleSubmit={login}
						pending={fetching}
						oauthProviders={oauthProviders}
					/>
				) : null}
				{path === "register" ? (
					<RegisterForm
						src={config.images.register}
						appName={config.appName}
						onClick={() => {
							setPath("login");
						}}
						handleSubmit={register}
						pending={fetching}
						oauthProviders={oauthProviders}
					/>
				) : null}
				{path === "forgot-password" ? (
					<ForgotPasswordForm
						src={config.images.forgot}
						onClick={() => {
							setPath("login");
						}}
						handleSubmit={async ({ email }) => {
							const { id } = await forgotPassword(email);
							setResetPasswordState({
								email,
								id,
							});
							setPath("reset-password");
						}}
						pending={fetching}
					/>
				) : null}
				{path === "reset-password" && resetPasswordState ? (
					<ResetPasswordForm
						src={config.images.reset}
						onClick={() => {
							clearVerification();
							setResetPasswordState(null);
							setPath("login");
						}}
						email={resetPasswordState.email}
						handleSubmit={async ({ code, password }) => {
							await resetPassword({
								id: resetPasswordState.id,
								code,
								password,
							});
						}}
						pending={fetching}
					/>
				) : null}
				{path === "verify" && verification ? (
					<VerifyForm
						src={config.images.verify}
						email={verification.email}
						handleSubmit={verifyAccount}
						handleResend={async () => {
							await startVerification(verification.email);
						}}
						handleBack={() => {
							clearVerification();
							setResetPasswordState(null);
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
