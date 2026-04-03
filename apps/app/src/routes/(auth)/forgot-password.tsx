import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { FC } from "react";
import { ForgotPasswordForm } from "shared";
import { useGuard } from "../../provider";

const ForgotPasswordRoute: FC = () => {
	const navigate = useNavigate();
	const { forgotPassword, fetching } = useGuard();

	return (
		<ForgotPasswordForm
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
