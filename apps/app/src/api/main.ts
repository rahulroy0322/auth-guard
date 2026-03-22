import type { UserType } from "base";
import { config } from "../config";

type SuccessType<T> = {
	success: true;
	data: T;
};

type ErrorType<E = Error> = {
	success: false;
	error: E;
};

type ResType<T> = SuccessType<T> | ErrorType<Error>;

type ReqDefType = {
	base: string;
	url: string;
	headers?: Record<string, string>;
};

type ReqGetType = ReqDefType & {
	method: "GET";
};

type ReqPostType = ReqDefType & {
	method: "POST";
	body: Record<string, unknown>;
};

type ReqParamsType = ReqGetType | ReqPostType;

const req = async <T>({
	base,
	url,
	method,
	headers,
	...props
}: ReqParamsType) => {
	const res = await fetch(`${base}/api/v1/auth/${url}`, {
		headers: {
			"content-type": "application/json",
			...(headers || {}),
		},
		method,
		body: (props as ReqPostType).body
			? JSON.stringify((props as ReqPostType).body)
			: undefined,
	});
	const data = (await res.json()) as ResType<T>;

	if (!data.success) {
		throw data.error;
	}

	return data.data;
};

const get = <T>(params: Omit<ReqGetType, "method">) =>
	req<T>({
		method: "GET",
		...params,
	});

const post = <T>(params: Omit<ReqPostType, "method">) =>
	req<T>({
		method: "POST",
		...params,
	});

const reqWithAccessToken = async <T>(params: Parameters<typeof req>[0]) => {
	try {
		return await req<T>({
			...params,
			headers: {
				Authorization: `Bearer ${localStorage.getItem(config.access)}`,
				...params.headers,
			},
		});
	} catch (e) {
		if (
			e &&
			typeof e === "object" &&
			"name" in e &&
			e.name === "AuthExpiredError"
		) {
			const { token } = await req<AuthResType>({
				base: params.base,
				url: "refresh",
				body: {},
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem(config.refresh)}`,
				},
			});

			saveToken(token);

			return await req<T>({
				...params,
				headers: {
					Authorization: `Bearer ${localStorage.getItem(config.access)}`,
					...params.headers,
				},
			});
		}
		throw e;
	}

	// 	try {
	// 		console.log(
	// 			params
	// 		);

	// 		return await req<T>({

	// 		})
	// 	} catch (e) {

	// }
};
const getWithAccessToken = <T>(params: Omit<ReqGetType, "method">) =>
	reqWithAccessToken<T>({
		method: "GET",
		...params,
	});

type AuthResType = {
	user: Omit<UserType, "password">;
	token?: TokenType;
};

type TokenType = {
	refresh?: string;
	access: string;
};

const saveToken = (token: Partial<TokenType> | undefined) => {
	if (token?.refresh) {
		localStorage.setItem(config.refresh, token.refresh);
	}
	if (token?.access) {
		localStorage.setItem(config.access, token.access);
	}
};

export type { AuthResType };
export { get, getWithAccessToken, post, req, saveToken };
