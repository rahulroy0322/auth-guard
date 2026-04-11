import { hash, randomBytes } from "node:crypto";
import { z } from "zod";
import {
	AuthInvalidStateError,
	AuthInvalidTokenError,
	AuthInvalidUserError,
} from "../error";
import type { ProviderType } from "../types";
import type { SmartLogger } from "../utils/smart-logger";

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

	private createState = () => randomBytes(64).toString("hex").normalize();

	private createCodeVerifier = () =>
		randomBytes(64).toString("hex").normalize();

	private createCodeChallenge = (codeVerifier: string) =>
		hash("sha256", codeVerifier, "base64url");

	public createLoginURL = () => {
		const state = this.createState();
		const codeVerifier = this.createCodeVerifier();

		const url = new URL(this.urls.auth);
		url.searchParams.set("client_id", this.clientId);
		url.searchParams.set("redirect_uri", this.redirectUrl().toString());
		url.searchParams.set("response_type", "code");
		url.searchParams.set("scope", this.scopes.join(" "));

		url.searchParams.set("state", state);
		url.searchParams.set("code_challenge_method", "S256");
		url.searchParams.set(
			"code_challenge",
			this.createCodeChallenge(codeVerifier),
		);

		return {
			url,
			state,
			codeVerifier,
		};
	};

	private validateState = ({
		expected,
		got,
	}: {
		expected: string;
		got: string | undefined;
	}) => expected === got;

	public fetchUser = async (
		logger: SmartLogger,
		code: string,
		state: {
			expected: string;
			got: string | undefined;
		},
		codeVerifier: string,
		{
			reqId,
		}: {
			reqId: string;
		},
	) => {
		const isValidState = this.validateState(state);
		if (!isValidState) {
			logger.error({
				msg: "Invalid state",
				user: null,
				reqId,
			});
			throw new AuthInvalidStateError();
		}

		const { accessToken, tokenType } = await this.fetchToken(
			logger,
			code,
			codeVerifier,
			{
				reqId,
			},
		);

		const res = await fetch(this.urls.user, {
			headers: {
				Authorization: `${tokenType} ${accessToken}`,
			},
		});

		if (!res.ok) {
			logger.error({
				msg: "User response is not ok",
				user: null,
				reqId,
				extra: {
					status: res.status,
					statusText: res.statusText,
				},
			});
			throw new AuthInvalidUserError();
		}

		const rawData = await res.json();

		const { data, success, error } = this.userInfo.schema.safeParse(rawData);
		if (!success) {
			logger.error({
				msg: "Invalid User response",
				user: null,
				reqId,
				extra: {
					cause: error.cause,
					message: error.message,
					errors: z.treeifyError(error).errors,
				},
			});
			throw new AuthInvalidUserError();
		}

		return this.userInfo.parser(data);
	};

	private fetchToken = async (
		logger: SmartLogger,
		code: string,
		codeVerifier: string,
		{
			reqId,
		}: {
			reqId: string;
		},
	) => {
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
				code_verifier: codeVerifier,
			}),
		});

		if (!res.ok) {
			logger.error({
				msg: "Token response is not ok",
				user: null,
				reqId,
				extra: {
					status: res.status,
					statusText: res.statusText,
				},
			});
			throw new AuthInvalidTokenError();
		}

		const rawData = await res.json();

		const { data, success, error } = this.tokenSchema.safeParse(rawData);
		if (!success) {
			logger.error({
				msg: "Invalid token response",
				user: null,
				reqId,
				extra: {
					cause: error.cause,
					message: error.message,
					errors: z.treeifyError(error).errors,
				},
			});
			throw new AuthInvalidTokenError();
		}
		return {
			accessToken: data.access_token,
			tokenType: data.token_type,
		};
	};
}

export { OAuth };
