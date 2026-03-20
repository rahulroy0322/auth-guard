import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@auth-guard/react/styles.css';
// import 'ui/index.css';
import "./index.css";
import { GuardProvider } from "@auth-guard/react";
import App from "./App.tsx";

const root = document.getElementById("root");

if (!root) {
	throw new Error("root not found!");
}

createRoot(root).render(
	<StrictMode>
		<GuardProvider>
			<App />
		</GuardProvider>
	</StrictMode>,
);
