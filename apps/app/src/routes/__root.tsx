import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { FC, ReactNode } from "react";
import { Toaster } from "ui/components/ui/sonner";
import { GuardProvider } from "../provider";

export const Route = createRootRoute({
	component: RootComponent,
});

type AppPropsType = {
	children: ReactNode;
};

const App: FC<AppPropsType> = ({ children }) => {
	return <GuardProvider>{children}</GuardProvider>;
};

function RootComponent() {
	return (
		<>
			<App>
				<div className="h-svh w-svw overflow-x-auto">
					<Outlet />
				</div>
			</App>
			<Toaster richColors closeButton />
			<TanStackRouterDevtools />
		</>
	);
}
