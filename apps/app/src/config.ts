const config = {
	base: "http://localhost:8000",
};

window.config = config;

declare global {
	interface Window {
		config: typeof config;
	}
}

export { config };
