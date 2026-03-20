import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/main.tsx"],
	format: ["esm", "cjs"],
	splitting: false,
	dts: true,
	sourcemap: true,
	clean: true,
	minify: true,
	external: ["react", "react-dom"],
});
