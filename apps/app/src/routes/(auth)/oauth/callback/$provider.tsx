import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ProviderType } from "base";
import { type FC, useEffect } from "react";
import { useGuard } from "../../../../provider";

const OAuthCallbackRoute: FC = () => {
	const navigate = useNavigate();
	const { finishOAuth } = useGuard();
	const { provider } = Route.useParams();

	useEffect(() => {
		const controller = new AbortController();
		const search = new URLSearchParams(window.location.search);
		const code = search.get("code");
		const state = search.get("state");

		if (!code || !state) {
			navigate({
				to: "/login",
			});
			return () => {
				controller.abort();
			};
		}
		const login = async () => {
			try {
				await finishOAuth(
					provider as ProviderType,
					{
						code,
						state,
					},
					controller.signal,
				);
				navigate({
					to: "/",
				});
			} catch (e) {
				console.error(e);

				navigate({
					to: "/login",
				});
			}
		};

		login();

		return () => {
			controller.abort();
		};
	}, [finishOAuth, navigate, provider]);

	return (
		<div className="min-h-80 flex items-center justify-center p-6 text-center">
			<p className="text-sm text-muted-foreground">Finishing sign in...</p>
		</div>
	);
};

const Route = createFileRoute("/(auth)/oauth/callback/$provider")({
	component: OAuthCallbackRoute,
});

export { Route };
