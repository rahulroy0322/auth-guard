import { type FC, useEffect } from "react";
import {
	ForgotPasswordForm,
	LoginForm,
	RegisterForm,
	ResetPasswordForm,
	VerifyForm,
} from "shared";
import { useGuard } from "../../provider";
import { usePath } from "../provider";
import { showAuthError } from "../shared/error";

const AuthFlowContent: FC = () => {
	const {
		config,
		fetching,
		login,
		register,
		oauthProviders,
		verification,
		forgotPassword,
		verifyAccount,
		resetPassword,
		startVerification,
		clearVerification,
	} = useGuard();
	const {
		path,
		setPath,
		resetPasswordState,
		setResetPasswordState,
		resetFlow,
	} = usePath();

	useEffect(() => {
		if (!verification || path === "verify") {
			return;
		}

		setPath("verify");
	}, [path, setPath, verification]);

	if (path === "login") {
		return (
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
		);
	}

	if (path === "register") {
		return (
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
		);
	}

	if (path === "forgot-password") {
		return (
			<ForgotPasswordForm
				src={config.images.forgot}
				onClick={() => {
					setPath("login");
				}}
				handleSubmit={async ({ email }) => {
					try {
						const { id } = await forgotPassword(email);
						setResetPasswordState({
							email,
							id,
						});
						setPath("reset-password");
					} catch (error) {
						showAuthError(error);
					}
				}}
				pending={fetching}
			/>
		);
	}

	if (path === "reset-password" && resetPasswordState) {
		return (
			<ResetPasswordForm
				src={config.images.reset}
				onClick={() => {
					clearVerification();
					resetFlow("login");
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
		);
	}

	if (path === "verify" && verification) {
		return (
			<VerifyForm
				src={config.images.verify}
				email={verification.email}
				handleSubmit={verifyAccount}
				handleResend={async () => {
					await startVerification(verification.email);
				}}
				handleBack={() => {
					clearVerification();
					resetFlow("login");
				}}
				pending={fetching}
			/>
		);
	}

	return null;
};

export { AuthFlowContent };
