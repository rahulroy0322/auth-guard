import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import type { FC } from "react";
import { LoginButton } from "../../auth/login.button";
import { RegisterButton } from "../../auth/register.button";

export const Route = createFileRoute("/(base)")({
	component: RouteComponent,
});

const Header: FC = () => {
	return (
		<header className="flex items-center justify-between p-2">
			<div className="flex gap-4">
				<LoginButton mode="page" render={<Link to="/login" />} variant="link">
					Login
				</LoginButton>
				<RegisterButton
					mode="page"
					render={<Link to="/register" />}
					variant="link"
				>
					Register
				</RegisterButton>
			</div>

			{/* <ProfileButton /> */}
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
