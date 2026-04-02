import type { ProviderType, UserType } from "base";

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

type ReqParamsType = ReqGetType | ReqPostType;

const reqImpl = async <T>({
	base,
	url,
	method,
	headers,
	body,
	signal,
}: Omit<ReqParamsType, "body"> & {
	body?: string | FormData;
}) => {
	const res = await fetch(`${base}/api/v1/auth/${url}`, {
		headers,
		credentials: "include",
		method,
		body,
		signal,
	});
	const data = (await res.json()) as ResType<T>;

	if (!data.success) {
		throw data.error;
	}

	return data.data;
};

const reqMultiPart = <T>(props: ReqPostMultiPartType) =>
	reqImpl<T>(
		props as ReqPostType & {
			body: FormData;
		},
	);

const req = <T>({ headers, ...props }: ReqParamsType) =>
	reqImpl<T>({
		...props,
		headers: {
			"content-type": "application/json",
			...(headers || {}),
		},
		...((props as ReqPostType).body
			? {
					body: JSON.stringify((props as ReqPostType).body),
				}
			: {}),
	} as Omit<ReqParamsType, "body"> & {
		body?: string;
	});

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

type VerifyAccountPayloadType = {
	id: string;
	code: string;
};

const startVerification = (base: string, email: string) =>
	post<StartVerificationReturnType>({
		base,
		url: "start-verification",
		body: {
			email,
		},
	});

const verifyAccount = (base: string, body: VerifyAccountPayloadType) =>
	patch<AuthResType>({
		base,
		url: "verify",
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
	StartVerificationReturnType,
	VerifyAccountPayloadType,
};

export {
	get,
	loginWithOAuthProvider,
	patch,
	patchMultiPart,
	post,
	startLoginWithOAuthProvider,
	startVerification,
	verifyAccount,
};
