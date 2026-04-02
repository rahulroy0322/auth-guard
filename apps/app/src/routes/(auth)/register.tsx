import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FC, useEffect } from "react";
import { RegisterForm } from "shared";
import { useGuard } from "../../provider";

const RegisterRoute: FC = () => {
	const navigate = useNavigate();
	const { register, fetching, verification, oauthProviders } = useGuard();

	useEffect(() => {
		if (!verification) {
			return;
		}

		navigate({
			to: "/verify",
		});
	}, [navigate, verification]);

	return (
		<RegisterForm
			nativeButton={false}
			render={<Link to="/login" />}
			handleSubmit={register}
			pending={fetching}
			oauthProviders={oauthProviders}
		/>
	);
};

export const Route = createFileRoute("/(auth)/register")({
	component: RegisterRoute,
});
