import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FC, useEffect } from "react";
import { LoginForm } from "shared";
import { useGuard } from "../../provider";

const LoginRoute: FC = () => {
	const navigate = useNavigate();
	const { login, fetching, verification, oauthProviders } = useGuard();

	useEffect(() => {
		if (!verification) {
			return;
		}

		navigate({
			to: "/verify",
		});
	}, [navigate, verification]);

	return (
		<LoginForm
			nativeButton={false}
			render={<Link to="/register" />}
			forgotPasswordProps={{
				nativeButton: false,
				render: <Link to="/forgot-password" />,
			}}
			handleSubmit={login}
			pending={fetching}
			oauthProviders={oauthProviders}
		/>
	);
};

const Route = createFileRoute("/(auth)/login")({
	component: LoginRoute,
});

export { Route };
