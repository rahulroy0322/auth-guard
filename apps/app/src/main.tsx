import { GuardProvider } from "@auth-guard/react";
import { type FC, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@auth-guard/react/styles.css";
import "./index.css";
import type { OAuthProviderOptionType } from "@auth-guard/react/diy";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { config } from "./config";
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
	<GuardProvider
		config={{
			baseUrl: config.base,
			images: {
				forgot: "https://cdn.undraw.co/illustration/forgot-password_nttj.svg",
				login: "https://cdn.undraw.co/illustration/login_weas.svg",
				register: "https://cdn.undraw.co/illustration/onboarding_dcq2.svg",
				reset: "https://cdn.undraw.co/illustration/forgot-password_nttj.svg",
				verify: "https://cdn.undraw.co/illustration/verify-data_k0y1.svg",
			},
		}}
		oauth={oauthProviders}
	>
		<RouterProvider router={router} />
	</GuardProvider>
);

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
