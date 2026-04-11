import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/**/*.ts"],
	format: ["esm", "cjs"],
	outDir: "dist",
	splitting: false,
	dts: true,
	sourcemap: false,
	clean: true,
	minify: true,
	platform: "node",
	external: ["@auth-guard/backend", "multer", "ua-parser-js", "zod", "express"],
	noExternal: ["schema"],
});
