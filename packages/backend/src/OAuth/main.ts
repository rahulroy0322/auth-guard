import { AuthServerError } from "../error";
import type { ProviderType } from "../types";
import type { OAuthType } from "../types/OAuth";
import { OAuth } from "./base";
import { Github } from "./github";
import { Google } from "./google";

const createOAuthClient = ({
	provider,
	callbackUri,
	clientId,
	clientSecret,
}: {
	provider: ProviderType;
	callbackUri: string;
	clientId: string;
	clientSecret: string;
}) => {
	switch (provider) {
		case "google":
			return new Google({
				callbackUri,
				clientId,
				clientSecret,
			});
		case "github":
			return new Github({
				callbackUri,
				clientId,
				clientSecret,
			});
		default: {
			throw new AuthServerError(
				`"${provider satisfies never}" in not implemented yet!`,
			);
		}
	}
};

const createOAuthClients = (oAuth: OAuthType<ProviderType> | null = null) => {
	const clients: Partial<Record<ProviderType, OAuth<unknown>>> = {};

	if (oAuth) {
		const { callbackUri, providers } = oAuth;

		for (const provider in providers) {
			const key = provider as keyof typeof providers;
			const config = providers[key];

			if (!config) {
				throw new AuthServerError(`"${provider}" in not configure properly`);
			}

			if (config instanceof OAuth) {
				clients[key] = config;
				continue;
			}

			clients[key] = createOAuthClient({
				provider: key as unknown as ProviderType,
				callbackUri,
				...config,
			}) as OAuth<unknown>;
		}
	}

	return clients;
};

export { createOAuthClients };
