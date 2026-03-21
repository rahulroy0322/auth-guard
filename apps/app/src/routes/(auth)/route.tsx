import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { FC } from "react";

const AuthRoute: FC = () => (
	<div className="h-full w-full flex items-center justify-center">
		<div className="max-w-sm md:max-w-4xl w-full ring-1 ring-ring rounded-lg shadow-lg shadow-primary/30">
			<Outlet />
		</div>
	</div>
);

const Route = createFileRoute("/(auth)")({
	component: AuthRoute,
});

export { Route };
