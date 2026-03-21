import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/"!</div>;
}
