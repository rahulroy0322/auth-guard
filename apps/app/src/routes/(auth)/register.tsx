import { createFileRoute, Link } from "@tanstack/react-router";
import type { FC } from "react";
import { RegisterForm } from "shared";
import { useGuard } from "../../provider";

const RegisterRoute: FC = () => {
	const { register, loading } = useGuard();

	return (
		<RegisterForm
			nativeButton={false}
			render={<Link to="/login" />}
			handleSubmit={register}
			pending={loading}
		/>
	);
};

export const Route = createFileRoute("/(auth)/register")({
	component: RegisterRoute,
});
