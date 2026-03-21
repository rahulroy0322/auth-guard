import { createFileRoute, Link } from "@tanstack/react-router";
import { RegisterForm } from "shared";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
});

function RouteComponent() {
	return <RegisterForm nativeButton={false} render={<Link to="/login" />} />;
}
