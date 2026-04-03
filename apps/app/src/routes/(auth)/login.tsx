import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FC, useEffect } from "react";
import { LoginForm } from "shared";
import { useGuard } from "../../provider";

const LoginRoute: FC = () => {
	const navigate = useNavigate();
	const { login, fetching, verification, oauthProviders,config } = useGuard();

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
		appName={config.appName}
		src={config.images.login}
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
