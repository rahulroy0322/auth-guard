const config = {
	refresh: "REFRESH_TOKEN",
	access: "ACCESS_TOKEN",
};

window.config = config;

declare global {
	interface Window {
		config: typeof config;
	}
}

export { config };
