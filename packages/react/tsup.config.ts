import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/main.ts"],
	format: ["esm", "cjs"],
	outDir: "dist",
	splitting: false,
	dts: true,
	sourcemap: true,
	clean: true,
	minify: true,
	external: ["react", "react-dom"],
});
