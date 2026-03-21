import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "shared";

export const Route = createFileRoute("/(auth)/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return <LoginForm nativeButton={false} render={<Link to="/register" />} />;
}
