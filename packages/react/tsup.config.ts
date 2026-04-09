import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/main.ts", "src/diy.ts"],
	format: ["esm", "cjs"],
	outDir: "dist",
	splitting: false,
	dts: true,
	sourcemap: false,
	clean: true,
	minify: true,
	external: [
		"react",
		"react-dom",
		"react/jsx-runtime",
		"react/compiler-runtime",
		"use-sync-external-store",
		"use-sync-external-store/shim",
		"use-sync-external-store/shim/with-selector",
	],
	noExternal: [
		"base",
		"form",
		"schema",
		"shared",
		"ui",
		"@base-ui/react",
		"sonner",
		"input-otp",
		"@remixicon/react",
		"class-variance-authority",
		"clsx",
		"tailwind-merge",
	],
	esbuildOptions(options) {
		options.loader = {
			...options.loader,
			".css": "css",
		};
	},
});
