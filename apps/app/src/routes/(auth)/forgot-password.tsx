import { useGuard } from "@auth-guard/react";
import { ForgotPasswordForm } from "@auth-guard/react/diy";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { FC } from "react";

const ForgotPasswordRoute: FC = () => {
	const navigate = useNavigate();
	const { forgotPassword, fetching, config } = useGuard();

	return (
		<ForgotPasswordForm
			src={config.images.forgot}
			nativeButton={false}
			render={<Link to="/login" />}
			handleSubmit={async ({ email }) => {
				const { id } = await forgotPassword(email);
				navigate({
					to: "/reset-password",
					search: {
						email,
						id,
					},
				});
			}}
			pending={fetching}
		/>
	);
};

const Route = createFileRoute("/(auth)/forgot-password")({
	component: ForgotPasswordRoute,
});

export { Route };
