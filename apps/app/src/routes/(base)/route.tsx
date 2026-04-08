import {
	LoginButton,
	ProfileButton,
	RegisterButton,
	Show,
} from "@auth-guard/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { FC } from "react";

const Header: FC = () => {
	return (
		<header className="flex items-center justify-between p-2">
			<Show when="logged-out">
				<div className="flex gap-4">
					<LoginButton mode="modal" variant="link">
						Login
					</LoginButton>
					<RegisterButton mode="modal" variant="link">
						Register
					</RegisterButton>
				</div>
			</Show>
			<Show when="logged-in">
				<ProfileButton />
			</Show>
		</header>
	);
};

const RootLayout: FC = () => (
	<>
		<Header />
		<Outlet />
	</>
);

const Route = createFileRoute("/(base)")({
	component: RootLayout,
});

export { Route };
