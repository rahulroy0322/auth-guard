import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { type FC, useEffect } from "react";
import { toast } from "ui/components/ui/sonner";
import { useGuard } from "../../provider";

const AuthRoute: FC = () => {
	const { user, error } = useGuard();

	useEffect(() => {
		if (error) {
			toast.error(error.name, {
				description: error.message,
			});
		}
	}, [error]);

	if (user) {
		return <Navigate to="/" />;
	}

	return (
		<div className="h-full w-full flex items-center justify-center">
			<div className="max-w-sm md:max-w-4xl w-full ring-1 ring-ring rounded-lg shadow-lg shadow-primary/30">
				<Outlet />
			</div>
		</div>
	);
};

const Route = createFileRoute("/(auth)")({
	component: AuthRoute,
});

export { Route };
