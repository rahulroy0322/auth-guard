import { type FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@auth-guard/react/styles.css";
import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import type { OAuthProviderOptionType } from "shared";
import { GuardProvider } from "./provider";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const root = document.getElementById("root");

if (!root) {
	throw new Error("root not found!");
}

const oauthProviders = [
	{
		provider: "apple",
		disabled: true,
	},
	{
		provider: "google",
	},
	{
		provider: "github",
	},
] as Omit<OAuthProviderOptionType, "onClick">[];

const App: FC = () => (
	<GuardProvider oauth={oauthProviders}>
		<RouterProvider router={router} />
	</GuardProvider>
);

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
