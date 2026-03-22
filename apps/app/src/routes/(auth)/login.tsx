import { createFileRoute, Link } from "@tanstack/react-router";
import type { FC } from "react";
import { LoginForm } from "shared";
import { useGuard } from "../../provider";

const LoginRoute: FC = () => {
	const { login, loading } = useGuard();

	return (
		<LoginForm
			nativeButton={false}
			render={<Link to="/register" />}
			handleSubmit={login}
			pending={loading}
		/>
	);
};

const Route = createFileRoute("/(auth)/login")({
	component: LoginRoute,
});

export { Route };
