import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import type { FC } from "react";
import { ResetPasswordForm } from "shared";
import { useGuard } from "../../provider";

const ResetPasswordRoute: FC = () => {
	const navigate = useNavigate();
	const { fetching, resetPassword,config } = useGuard();
	const search = new URLSearchParams(window.location.search);
	const id = search.get("id");
	const email = search.get("email") ?? undefined;

	if (!id) {
		return <Navigate to="/forgot-password" />;
	}

	return (
		<ResetPasswordForm
			src={config.images.reset}
			nativeButton={false}
			render={<Link to="/login" />}
			email={email}
			handleSubmit={async ({ code, password }) => {
				await resetPassword({
					id,
					code,
					password,
				});
				navigate({
					to: "/",
				});
			}}
			pending={fetching}
		/>
	);
};

const Route = createFileRoute("/(auth)/reset-password")({
	component: ResetPasswordRoute,
});

export { Route };
