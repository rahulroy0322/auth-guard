import { resolve } from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss({
			optimize: {
				minify: true,
			},
		}),
		babel({ presets: [reactCompilerPreset()] }),
	],
	resolve: {
		alias:
			command === "serve"
				? [
						{
							find: "@auth-guard/react/styles.css",
							replacement: resolve(
								__dirname,
								"../../packages/react/src/style.css",
							),
						},
						{
							find: "@auth-guard/react/diy",
							replacement: resolve(
								__dirname,
								"../../packages/react/src/diy.ts",
							),
						},
						{
							find: "@auth-guard/react",
							replacement: resolve(
								__dirname,
								"../../packages/react/src/main.ts",
							),
						},
					]
				: [],
	},
}));
