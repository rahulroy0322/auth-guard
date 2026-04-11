import type { ProviderType, UserType } from "@auth-guard/types";

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
} & Partial<Pick<Request, "signal">>;

type ReqGetType = ReqDefType & {
	method: "GET";
};

type ReqPostType = ReqDefType & {
	method: "POST" | "PATCH";
	body: Record<string, unknown>;
};

type ReqPostMultiPartType = Omit<ReqPostType, "body"> & {
	body: FormData;
};

type RawRequestParamsType = {
	base: string;
	body?: FormData | string;
	headers?: Record<string, string>;
	method: ReqGetType["method"] | ReqPostType["method"];
	signal?: Request["signal"];
	url: string;
};

const buildAuthUrl = (base: string, url: string) =>
	`${base}/api/v1/auth/${url}`;

const parseResponse = async <T>(response: Response) => {
	const data = (await response.json()) as ResType<T>;

	if (!data.success) {
		throw data.error;
	}

	return data.data;
};

const reqImpl = async <T>({
	base,
	url,
	method,
	headers,
	body,
	signal,
}: RawRequestParamsType) => {
	const response = await fetch(buildAuthUrl(base, url), {
		headers,
		credentials: "include",
		method,
		body,
		signal,
	});

	return parseResponse<T>(response);
};

const reqMultiPart = <T>({
	body,
	...props
}: Omit<ReqPostMultiPartType, "method"> & {
	method: ReqPostMultiPartType["method"];
}) =>
	reqImpl<T>({
		...props,
		body,
	});

const req = <T>(params: ReqGetType | ReqPostType) => {
	if (params.method === "GET") {
		const { method, ...rest } = params;

		return reqImpl<T>({
			...rest,
			method,
		});
	}

	const { body, headers, method, ...rest } = params;

	return reqImpl<T>({
		...rest,
		method,
		headers: {
			"content-type": "application/json",
			...(headers || {}),
		},
		body: JSON.stringify(body),
	});
};

type SafeUserType = Omit<UserType, "password">;

type AuthStatusReturnType =
	| {
			authenticated: true;
			token: string;
			user: SafeUserType;
	  }
	| {
			authenticated: false;
			user: null;
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

const patch = <T>(params: Omit<ReqPostType, "method">) =>
	req<T>({
		method: "PATCH",
		...params,
	});

const patchMultiPart = <T>(params: Omit<ReqPostMultiPartType, "method">) =>
	reqMultiPart<T>({
		method: "PATCH",
		...params,
	});

type AuthResType = {
	user: SafeUserType;
	token?: string;
};

type StartVerificationReturnType = {
	id: string;
};

type ForgotPasswordPayloadType = {
	email: string;
};

type VerifyAccountPayloadType = {
	id: string;
	code: string;
};

type ResetPasswordPayloadType = VerifyAccountPayloadType & {
	password: string;
};

const startVerification = (base: string, email: string) =>
	post<StartVerificationReturnType>({
		base,
		url: "start-verification",
		body: {
			email,
		},
	});

const forgotPassword = (base: string, body: ForgotPasswordPayloadType) =>
	post<StartVerificationReturnType>({
		base,
		url: "forgot-password",
		body,
	});

const verifyAccount = (base: string, body: VerifyAccountPayloadType) =>
	patch<AuthResType>({
		base,
		url: "verify",
		body,
	});

const resetPassword = (base: string, body: ResetPasswordPayloadType) =>
	patch<AuthResType>({
		base,
		url: "reset-password",
		body,
	});

const startLoginWithOAuthProvider = (base: string, provider: ProviderType) =>
	get<{
		url: string;
	}>({
		base,
		url: `oauth/${provider}`,
	});

const loginWithOAuthProvider = (
	base: string,
	provider: ProviderType,
	query: {
		code: string;
		state: string;
	},
	signal: Request["signal"],
) =>
	get<AuthResType>({
		base,
		url: `oauth/callback/${provider}?${new URLSearchParams(query).toString()}`,
		signal,
	});

export type {
	AuthResType,
	AuthStatusReturnType,
	ForgotPasswordPayloadType,
	ResetPasswordPayloadType,
	StartVerificationReturnType,
	VerifyAccountPayloadType,
};

export {
	forgotPassword,
	get,
	loginWithOAuthProvider,
	patch,
	patchMultiPart,
	post,
	resetPassword,
	startLoginWithOAuthProvider,
	startVerification,
	verifyAccount,
};
