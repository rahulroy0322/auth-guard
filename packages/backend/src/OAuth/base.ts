import type { ProviderType } from "base";
import { z } from "zod";
import { AuthInvalidTokenError, AuthInvalidUserError } from "../error";

class OAuth<T> {
	constructor(
		private readonly provider: ProviderType,
		private readonly clientId: string,
		private readonly clientSecret: string,
		private readonly callbackUri: string,
		private readonly scopes: string[],
		private readonly urls: {
			auth: string;
			token: string;
			user: string;
		},
		private readonly userInfo: {
			schema: z.ZodSchema<T>;
			parser: (data: T) => {
				email: string;
				name: string;
				avatarUrl: string | null;
			};
		},
		private readonly tokenSchema = z.object({
			access_token: z.string(),
			token_type: z.string(),
		}),
	) {}

	private redirectUrl = () => {
		const base = this.callbackUri.endsWith("/")
			? this.callbackUri
			: `${this.callbackUri}/`;
		return new URL(this.provider, base);
	};

	public createLoginURL = () => {
		const url = new URL(this.urls.auth);
		url.searchParams.set("client_id", this.clientId);
		url.searchParams.set("redirect_uri", this.redirectUrl().toString());
		url.searchParams.set("response_type", "code");
		url.searchParams.set("scope", this.scopes.join(" "));
		return {
			url,
		};
	};

	public fetchUser = async (code: string) => {
		const { accessToken, tokenType } = await this.fetchToken(code);

		const res = await fetch(this.urls.user, {
			headers: {
				Authorization: `${tokenType} ${accessToken}`,
			},
		});

		if (!res.ok) {
			throw new AuthInvalidUserError();
		}

		const rawData = await res.json();

		const { data, success } = this.userInfo.schema.safeParse(rawData);
		if (!success) {
			throw new AuthInvalidUserError();
		}

		return this.userInfo.parser(data);
	};

	private fetchToken = async (code: string) => {
		const res = await fetch(this.urls.token, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				code,
				redirect_uri: this.redirectUrl().toString(),
				grant_type: "authorization_code",
				client_id: this.clientId,
				client_secret: this.clientSecret,
			}),
		});

		if (!res.ok) {
			throw new AuthInvalidTokenError();
		}

		const rawData = await res.json();
		const { data, success } = this.tokenSchema.safeParse(rawData);
		if (!success) {
			throw new AuthInvalidTokenError();
		}
		return {
			accessToken: data.access_token,
			tokenType: data.token_type,
		};
	};
}

export { OAuth };
