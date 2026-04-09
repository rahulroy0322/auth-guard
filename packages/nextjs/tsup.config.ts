import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["src/main.ts", "src/diy.ts"],
		format: ["esm", "cjs"],
		outDir: "dist",
		splitting: false,
		dts: true,
		sourcemap: false,
		clean: true,
		minify: true,
		external: [
			/next/,
			"react",
			"react-dom",
			"react/jsx-runtime",
			"react/compiler-runtime",
			"use-sync-external-store",
			"use-sync-external-store/shim",
			"use-sync-external-store/shim/with-selector",
		],
		noExternal: [/@auth-guard\/react/],
		esbuildOptions(options) {
			options.loader = {
				...options.loader,
				".css": "css",
			};
		},
	},
	{
		entry: ["src/server/main.ts"],
		format: ["esm", "cjs"],
		outDir: "dist/server",
		splitting: false,
		dts: true,
		sourcemap: false,
		clean: false,
		minify: true,
		platform: "node",
		external: [/next/, "bcrypt", "jsonwebtoken", "nanoid", "zod"],
		noExternal: [/@auth-guard\/backend/, /@auth-guard\/react/, "schema"],
	},
]);
