import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { FC } from "react";
import { LoginButton } from "../../auth/login.button";
import { ProfileButton } from "../../auth/profile.button";
import { RegisterButton } from "../../auth/register.button";
import { Show } from "../../utils";

export const Route = createFileRoute("/(base)")({
	component: RouteComponent,
});

const Header: FC = () => {
	return (
		<header className="flex items-center justify-between p-2">
			<Show when="loged-out">
				<div className="flex gap-4">
					<LoginButton mode="model" variant="link">
						Login
					</LoginButton>
					<RegisterButton mode="model" variant="link">
						Register
					</RegisterButton>
				</div>
			</Show>
			<Show when="loged-in">
				<ProfileButton />
			</Show>
		</header>
	);
};

function RouteComponent() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
}
