import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { type FC, useEffect } from "react";
import { VerifyForm } from "shared";
import { useGuard } from "../../provider";

const VerifyRoute: FC = () => {
	const navigate = useNavigate(); const { config } = useGuard()
	const {
		verification,
		verifyAccount,
		startVerification,
		clearVerification,
		fetching,
	} = useGuard();

	useEffect(() => {
		if (verification) {
			return;
		}

		navigate({
			to: "/login",
		});
	}, [navigate, verification]);

	if (!verification) {
		return <Navigate to="/login" />;
	}

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
				navigate({
					to: "/login",
				});
			}}
			pending={fetching}
		/>
	);
};

export const Route = createFileRoute("/(auth)/verify")({
	component: VerifyRoute,
});
